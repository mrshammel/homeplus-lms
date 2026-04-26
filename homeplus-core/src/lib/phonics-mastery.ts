import { prisma } from './db';
import { SpacedReviewItem, StudentMastery } from '@prisma/client';

/**
 * Mastery Advancement Logic
 * - Decoding Threshold: 90%
 * - Encoding Threshold: 85%
 * - 3-Strike Rule: 3 consecutive mastery failures halts progression and flags teacher.
 */

export const MASTERY_THRESHOLDS = {
  DECODING: 0.90, // 90%
  ENCODING: 0.85, // 85%
};

export const MAX_CONSECUTIVE_FAILURES = 3;

/**
 * Process a student's attempt at a phonics lesson block/assessment.
 */
export async function processMasteryAttempt(
  studentId: string,
  lessonId: string,
  decodingAccuracy: number,
  encodingAccuracy: number
): Promise<{ success: boolean; status: string; teacherAlert: boolean }> {
  
  const masteryRecord = await prisma.studentMastery.findUnique({
    where: { studentId_lessonId: { studentId, lessonId } }
  });

  const passed = decodingAccuracy >= MASTERY_THRESHOLDS.DECODING && encodingAccuracy >= MASTERY_THRESHOLDS.ENCODING;
  
  if (!masteryRecord) {
    // First attempt
    await prisma.studentMastery.create({
      data: {
        studentId,
        lessonId,
        status: passed ? 'mastered' : 'in_progress',
        attempts: 1,
        lastDecodingAccuracy: decodingAccuracy,
        lastEncodingAccuracy: encodingAccuracy
      }
    });

    return { 
      success: passed, 
      status: passed ? 'mastered' : 'in_progress', 
      teacherAlert: false 
    };
  }

  // Calculate new state based on 3-strike rule
  let newStatus = passed ? 'mastered' : masteryRecord.status;
  let teacherAlert = false;
  const attempts = masteryRecord.attempts + 1;

  if (!passed) {
    if (attempts >= MAX_CONSECUTIVE_FAILURES && newStatus !== 'teacher_override') {
      newStatus = 'struggling';
      teacherAlert = true;
    }
  } else if (newStatus === 'struggling') {
    // If they passed after struggling, keep them struggling until teacher clears it, 
    // or let it pass? The plan says "teacher override is required to proceed".
    // So if status is struggling, they shouldn't auto-advance even if they pass later, 
    // or passing clears the stall. The plan says "Auto-advancement is disabled; teacher override is required to proceed."
    // So we don't mark as mastered.
    newStatus = 'struggling';
    teacherAlert = true;
  }

  await prisma.studentMastery.update({
    where: { id: masteryRecord.id },
    data: {
      status: newStatus,
      attempts,
      lastDecodingAccuracy: decodingAccuracy,
      lastEncodingAccuracy: encodingAccuracy
    }
  });

  return { success: passed && newStatus === 'mastered', status: newStatus, teacherAlert };
}


/**
 * Spaced Review Engine Algorithm
 * - Intervals: Day 1, Day 3, Day 7, Day 21, Day 60.
 */
export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 21, 60];

export async function processSpacedReviewItem(
  studentId: string,
  itemId: string,
  itemType: string,
  score: number
): Promise<SpacedReviewItem> {
  let reviewItem = await prisma.spacedReviewItem.findUnique({
    where: {
      studentId_itemId_itemType: { studentId, itemId, itemType }
    }
  });

  if (!reviewItem) {
    // Newly introduced item enters the queue
    reviewItem = await prisma.spacedReviewItem.create({
      data: {
        studentId,
        itemId,
        itemType,
        currentIntervalIndex: 0,
        nextReviewDate: new Date(Date.now() + REVIEW_INTERVALS_DAYS[0] * 24 * 60 * 60 * 1000)
      }
    });
    return reviewItem;
  }

  // Update logic based on score
  const passed = score >= 0.90; // If student scores >= 90%, advance. Else reset.

  let newIntervalIndex = reviewItem.currentIntervalIndex;
  let consecutiveFailures = reviewItem.consecutiveFailures;

  if (passed) {
    newIntervalIndex = Math.min(newIntervalIndex + 1, REVIEW_INTERVALS_DAYS.length - 1);
    consecutiveFailures = 0;
  } else {
    newIntervalIndex = 0; // Regression to Day 1
    consecutiveFailures += 1;
  }

  const daysToAdd = REVIEW_INTERVALS_DAYS[newIntervalIndex];
  const nextReviewDate = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);

  return prisma.spacedReviewItem.update({
    where: { id: reviewItem.id },
    data: {
      currentIntervalIndex: newIntervalIndex,
      nextReviewDate,
      consecutiveFailures
    }
  });
}

/**
 * Interleaving: Get items due for review
 * Warm-ups pull 5-8 items from the queue.
 */
export async function getDueReviewItems(studentId: string, limit: number = 8) {
  return prisma.spacedReviewItem.findMany({
    where: {
      studentId,
      nextReviewDate: { lte: new Date() }
    },
    orderBy: {
      nextReviewDate: 'asc'
    },
    take: limit
  });
}
