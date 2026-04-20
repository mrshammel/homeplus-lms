// ============================================
// Review Scheduler - Home Plus LMS
// ============================================
// Spaced review queue generation and management.
// Runs as cron-callable service or on-demand.
//
// Spacing intervals: 1d -> 3d -> 7d -> 14d -> 30d
// Daily caps by grade band.
// Priority formula considers: overdue, prerequisite, weakness, regression, confidence.

import { prisma } from '@/lib/db';
import type { SkillMasteryState } from '@prisma/client';

// ─── Configuration ───

const SPACING_INTERVALS_DAYS = [1, 3, 7, 14, 30];

const DAILY_CAPS: Record<string, number> = {
  '1-3': 8,
  '4-6': 10,
  '7-9': 12,
};

function getDailyCap(gradeLevel: number | null): number {
  if (!gradeLevel) return 10;
  if (gradeLevel <= 3) return DAILY_CAPS['1-3'];
  if (gradeLevel <= 6) return DAILY_CAPS['4-6'];
  return DAILY_CAPS['7-9'];
}

// ─── Priority Computation ───

interface MasteryForPriority {
  masteryState: SkillMasteryState;
  nextReviewAt: Date | null;
  failedRetrievalCount: number;
  confidenceScore: number | null;
  consecutiveSuccessCount: number;
}

interface SkillForPriority {
  isCorePrerequisite: boolean;
}

/**
 * Compute review priority for a skill.
 * Higher = more urgent.
 */
export function computePriority(
  mastery: MasteryForPriority,
  skill: SkillForPriority,
): number {
  let priority = 0;
  const now = new Date();

  // Overdue weight (+20)
  if (mastery.nextReviewAt && mastery.nextReviewAt < now) {
    priority += 20;
    // Extra urgency for very overdue (> 3 days)
    const daysPast = Math.floor((now.getTime() - mastery.nextReviewAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysPast > 3) priority += 5;
  }

  // Core prerequisite weight (+15)
  if (skill.isCorePrerequisite) {
    priority += 15;
  }

  // Weakness weight: repeated failed retrieval (+15)
  if (mastery.failedRetrievalCount >= 2) {
    priority += 15;
  }

  // Needs support weight (+10)
  if (mastery.masteryState === 'NEEDS_SUPPORT') {
    priority += 10;
  }

  // Review due regression weight (+8)
  if (mastery.masteryState === 'REVIEW_DUE') {
    priority += 8;
  }

  // Confidence risk weight (+5)
  if (mastery.confidenceScore !== null && mastery.confidenceScore <= 2) {
    priority += 5;
  }

  return priority;
}

// ─── Queue Generation ───

/**
 * Generate review queue items for a single student.
 * Called by cron job or on-demand.
 */
export async function generateReviewQueue(studentId: string): Promise<number> {
  // Fetch student grade level for daily cap
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { gradeLevel: true },
  });
  const cap = getDailyCap(student?.gradeLevel ?? null);

  // Count already-active items for today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const existingToday = await prisma.reviewQueueItem.count({
    where: {
      studentId,
      status: 'DUE',
      dueDate: { gte: todayStart, lte: todayEnd },
    },
  });

  const slotsAvailable = Math.max(0, cap - existingToday);
  if (slotsAvailable === 0) return 0;

  // Find skills needing review
  const dueSkills = await prisma.studentSkillMastery.findMany({
    where: {
      studentId,
      nextReviewAt: { lte: new Date() },
      masteryState: { in: ['MASTERED', 'DEVELOPING', 'REVIEW_DUE', 'NEEDS_SUPPORT'] },
    },
    include: { skill: true },
  });

  if (dueSkills.length === 0) return 0;

  // Compute priority and sort
  const prioritized = dueSkills
    .map((m) => ({
      mastery: m,
      skill: m.skill,
      priority: computePriority(m, m.skill),
    }))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, slotsAvailable);

  // Check for duplicate active queue items
  const existingItems = await prisma.reviewQueueItem.findMany({
    where: {
      studentId,
      status: 'DUE',
      skillId: { in: prioritized.map((p) => p.skill.id) },
    },
    select: { skillId: true },
  });
  const existingSkillIds = new Set(existingItems.map((e) => e.skillId));

  // Create new queue items (skip duplicates)
  let created = 0;
  for (const item of prioritized) {
    if (existingSkillIds.has(item.skill.id)) continue;

    await prisma.reviewQueueItem.create({
      data: {
        studentId,
        skillId: item.skill.id,
        dueDate: new Date(),
        priority: item.priority,
        status: 'DUE',
      },
    });
    created++;
  }

  return created;
}

/**
 * Generate review queues for ALL active students.
 * Called by cron endpoint.
 */
export async function generateAllReviewQueues(): Promise<{ studentsProcessed: number; itemsCreated: number }> {
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    select: { id: true },
  });

  let totalItems = 0;
  for (const student of students) {
    const count = await generateReviewQueue(student.id);
    totalItems += count;
  }

  return { studentsProcessed: students.length, itemsCreated: totalItems };
}

// ─── Review Result Processing ───

interface ProcessReviewParams {
  itemId: string;
  score: number;
  maxScore: number;
  confidence?: number;
}

/**
 * Process a completed review item.
 * Updates the queue item, records evidence, and recomputes mastery.
 */
export async function processReviewResult(params: ProcessReviewParams): Promise<void> {
  const { itemId, score, maxScore, confidence } = params;

  const item = await prisma.reviewQueueItem.findUnique({
    where: { id: itemId },
    include: { skill: true },
  });
  if (!item || item.status !== 'DUE') return;

  // Mark item completed
  await prisma.reviewQueueItem.update({
    where: { id: itemId },
    data: { status: 'COMPLETED', completedAt: new Date() },
  });

  // Record evidence via the mastery engine
  const { recordEvidence } = await import('./unified-mastery-engine');
  await recordEvidence({
    studentId: item.studentId,
    skillId: item.skillId,
    sourceType: 'RETRIEVAL',
    sourceId: itemId,
    score,
    maxScore,
    confidence,
  });

  // Update last reviewed timestamp
  await prisma.studentSkillMastery.update({
    where: { studentId_skillId: { studentId: item.studentId, skillId: item.skillId } },
    data: { lastReviewedAt: new Date() },
  });
}

// ─── Student Review Data ───

export interface ReviewDueData {
  dueCount: number;
  overdueCount: number;
  completedTodayCount: number;
  items: Array<{
    id: string;
    skillId: string;
    skillTitle: string;
    skillCode: string;
    dueDate: Date;
    priority: number;
    isOverdue: boolean;
  }>;
}

/**
 * Get review queue data for a student's dashboard / review page.
 */
export async function getStudentReviewDue(studentId: string): Promise<ReviewDueData> {
  const now = new Date();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const items = await prisma.reviewQueueItem.findMany({
    where: { studentId, status: 'DUE' },
    include: { skill: { select: { title: true, code: true } } },
    orderBy: { priority: 'desc' },
  });

  const completedToday = await prisma.reviewQueueItem.count({
    where: {
      studentId,
      status: 'COMPLETED',
      completedAt: { gte: todayStart },
    },
  });

  const overdueCount = items.filter((i) => i.dueDate < now).length;

  return {
    dueCount: items.length,
    overdueCount,
    completedTodayCount: completedToday,
    items: items.map((i) => ({
      id: i.id,
      skillId: i.skillId,
      skillTitle: i.skill.title,
      skillCode: i.skill.code,
      dueDate: i.dueDate,
      priority: i.priority,
      isOverdue: i.dueDate < now,
    })),
  };
}

// ─── Interval Selection ───

/**
 * Get the next spacing interval based on consecutive successes.
 */
export function getNextInterval(consecutiveSuccesses: number, confidence: number | null): number {
  const idx = Math.min(consecutiveSuccesses, SPACING_INTERVALS_DAYS.length - 1);
  let days = SPACING_INTERVALS_DAYS[idx];

  // Adjust for confidence
  if (confidence !== null) {
    if (confidence >= 4) {
      // High confidence -> extend slightly
      days = Math.min(days + 1, 30);
    } else if (confidence <= 2) {
      // Low confidence -> shorten
      days = Math.max(1, days - 1);
    }
  }

  return days;
}

// ─── Expiry ───

/**
 * Expire old review items that were never completed.
 * Called periodically to clean up stale queue entries.
 */
export async function expireStaleItems(daysOld: number = 7): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysOld);

  const result = await prisma.reviewQueueItem.updateMany({
    where: {
      status: 'DUE',
      dueDate: { lt: cutoff },
    },
    data: { status: 'EXPIRED' },
  });

  return result.count;
}
