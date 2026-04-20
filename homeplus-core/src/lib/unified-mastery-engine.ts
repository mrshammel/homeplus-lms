// ============================================
// Unified Mastery Engine - Home Plus LMS
// ============================================
// Consolidated mastery engine replacing the 4 subject-specific engines.
// Subject behavior is driven by config, not separate engine classes.
//
// Responsibilities:
//   - evaluate quiz submissions (replacing ScienceMasteryEngine, etc.)
//   - record evidence per skill
//   - compute durable mastery state
//   - schedule next review
//   - flag needs_support and teacher review
//
// This is the SINGLE source of truth for mastery logic.

import { prisma } from '@/lib/db';
import type { SkillMasteryState, EvidenceSource } from '@prisma/client';
import type { SubjectMode } from './lesson-types';
import type { MasteryResult, MasteryConfig } from './lesson-types';

// ─── Subject Configuration ───

export interface SubjectMasteryConfig extends MasteryConfig {
  evidenceWeights: Record<string, number>;
  masteryThresholds: { practicing: number; developing: number; mastered: number };
  requiresHighWeightEvidence: boolean;
  requiresLaterRetrieval: boolean;
  minEvidenceForMastery: number;
}

export const SUBJECT_MASTERY_CONFIGS: Record<SubjectMode, SubjectMasteryConfig> = {
  SCIENCE: {
    passPercent: 80,
    maxRetries: 5,
    reteachEnabled: true,
    immediateCorrectiveFeedback: false,
    evidenceWeights: { MASTERY_CHECK: 0.40, RETRIEVAL: 0.20, MIXED_PRACTICE: 0.15, GUIDED_PRACTICE: 0.10, ASSIGNMENT: 0.10, TEACHER_OBSERVATION: 0.05 },
    masteryThresholds: { practicing: 0.40, developing: 0.60, mastered: 0.80 },
    requiresHighWeightEvidence: true,
    requiresLaterRetrieval: true,
    minEvidenceForMastery: 2,
  },
  ELA: {
    passPercent: 0,
    maxRetries: 0,
    reteachEnabled: false,
    immediateCorrectiveFeedback: false,
    evidenceWeights: { MASTERY_CHECK: 0.30, RETRIEVAL: 0.20, MIXED_PRACTICE: 0.15, GUIDED_PRACTICE: 0.15, ASSIGNMENT: 0.15, TEACHER_OBSERVATION: 0.05 },
    masteryThresholds: { practicing: 0.40, developing: 0.60, mastered: 0.80 },
    requiresHighWeightEvidence: true,
    requiresLaterRetrieval: true,
    minEvidenceForMastery: 2,
  },
  MATH: {
    passPercent: 70,
    maxRetries: 5,
    reteachEnabled: false,
    immediateCorrectiveFeedback: true,
    evidenceWeights: { MASTERY_CHECK: 0.40, RETRIEVAL: 0.20, MIXED_PRACTICE: 0.15, GUIDED_PRACTICE: 0.10, ASSIGNMENT: 0.10, TEACHER_OBSERVATION: 0.05 },
    masteryThresholds: { practicing: 0.40, developing: 0.60, mastered: 0.80 },
    requiresHighWeightEvidence: true,
    requiresLaterRetrieval: true,
    minEvidenceForMastery: 2,
  },
  SOCIAL_STUDIES: {
    passPercent: 0,
    maxRetries: 0,
    reteachEnabled: false,
    immediateCorrectiveFeedback: false,
    evidenceWeights: { MASTERY_CHECK: 0.30, RETRIEVAL: 0.20, MIXED_PRACTICE: 0.15, GUIDED_PRACTICE: 0.15, ASSIGNMENT: 0.15, TEACHER_OBSERVATION: 0.05 },
    masteryThresholds: { practicing: 0.40, developing: 0.60, mastered: 0.80 },
    requiresHighWeightEvidence: true,
    requiresLaterRetrieval: true,
    minEvidenceForMastery: 2,
  },
  GENERAL: {
    passPercent: 70,
    maxRetries: 3,
    reteachEnabled: false,
    immediateCorrectiveFeedback: false,
    evidenceWeights: { MASTERY_CHECK: 0.40, RETRIEVAL: 0.20, MIXED_PRACTICE: 0.15, GUIDED_PRACTICE: 0.10, ASSIGNMENT: 0.10, TEACHER_OBSERVATION: 0.05 },
    masteryThresholds: { practicing: 0.40, developing: 0.60, mastered: 0.80 },
    requiresHighWeightEvidence: true,
    requiresLaterRetrieval: true,
    minEvidenceForMastery: 2,
  },
};

export function getSubjectConfig(mode: SubjectMode): SubjectMasteryConfig {
  return SUBJECT_MASTERY_CONFIGS[mode] || SUBJECT_MASTERY_CONFIGS.GENERAL;
}

// ─── Quiz Evaluation (replaces 4 subject engines) ───

function scoreAnswers(
  answers: Array<{ questionId: string; response: string }>,
  questions: Array<{
    id: string;
    correctAnswer: string | null;
    outcomeCode: string | null;
    options: any;
    questionType: string;
  }>,
): {
  correct: number;
  total: number;
  missedOutcomes: string[];
  results: Array<{ questionId: string; correct: boolean; outcomeCode: string | null }>;
} {
  let correct = 0;
  const missedOutcomes: string[] = [];
  const results: Array<{ questionId: string; correct: boolean; outcomeCode: string | null }> = [];

  for (const answer of answers) {
    const q = questions.find((qq) => qq.id === answer.questionId);
    if (!q) continue;

    let isCorrect = false;
    if (q.questionType === 'MULTIPLE_CHOICE' && q.options) {
      const opts = q.options as Array<{ value: string; correct?: boolean }>;
      const selected = opts.find((o) => o.value === answer.response);
      isCorrect = !!selected?.correct;
    } else {
      isCorrect =
        q.correctAnswer !== null &&
        answer.response.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
    }

    if (isCorrect) {
      correct++;
    } else if (q.outcomeCode && !missedOutcomes.includes(q.outcomeCode)) {
      missedOutcomes.push(q.outcomeCode);
    }

    results.push({ questionId: q.id, correct: isCorrect, outcomeCode: q.outcomeCode });
  }

  return { correct, total: answers.length, missedOutcomes, results };
}

/**
 * Evaluate a quiz submission. Replaces the 4 per-subject evaluate() methods.
 * Subject-specific behavior (quiz gating, reteach, corrective feedback) is
 * driven entirely by config.
 */
export function evaluateQuiz(
  answers: Array<{ questionId: string; response: string }>,
  questions: Array<{
    id: string;
    correctAnswer: string | null;
    outcomeCode: string | null;
    options: any;
    questionType: string;
  }>,
  previousAttempts: Array<{
    questionId: string;
    correct: boolean;
    attemptNumber: number;
  }>,
  config: SubjectMasteryConfig,
): MasteryResult {
  const { correct, total, missedOutcomes, results } = scoreAnswers(answers, questions);
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;

  // Quiz-gated subjects (passPercent > 0) require score threshold
  // Completion-based subjects (passPercent === 0) pass if any responses
  const isQuizGated = config.passPercent > 0;
  const hasResponses = answers.length > 0;
  const passed = isQuizGated
    ? score >= config.passPercent
    : hasResponses && (total === 0 || score >= 60);

  // Reteach detection (Science-specific via config.reteachEnabled)
  let needsReteach = false;
  let reteachOutcome: string | undefined;

  if (!passed && config.reteachEnabled) {
    const outcomeMissStreaks: Record<string, number> = {};
    const sortedPrev = [...previousAttempts].sort((a, b) => a.attemptNumber - b.attemptNumber);
    for (const prev of sortedPrev) {
      const q = questions.find((qq) => qq.id === prev.questionId);
      if (!q?.outcomeCode) continue;
      outcomeMissStreaks[q.outcomeCode] = prev.correct ? 0 : (outcomeMissStreaks[q.outcomeCode] || 0) + 1;
    }
    for (const r of results) {
      if (!r.outcomeCode) continue;
      if (!r.correct) {
        outcomeMissStreaks[r.outcomeCode] = (outcomeMissStreaks[r.outcomeCode] || 0) + 1;
        if (outcomeMissStreaks[r.outcomeCode] >= 2) {
          needsReteach = true;
          reteachOutcome = r.outcomeCode;
          break;
        }
      } else {
        outcomeMissStreaks[r.outcomeCode] = 0;
      }
    }
  }

  const attemptCount = Math.max(...previousAttempts.map((a) => a.attemptNumber), 0) + 1;
  const canRetry = isQuizGated
    ? !passed && !needsReteach && attemptCount < config.maxRetries
    : !passed;

  // Feedback generation
  let feedback: string;
  if (passed) {
    if (isQuizGated) {
      feedback = `Great work! You scored ${score}%. Mastery achieved!`;
    } else {
      feedback = `Nice work! Your responses have been submitted.${
        total > 0 ? ` You scored ${score}% on auto-scored items.` : ''
      } Your teacher may review your written work.`;
    }
  } else if (needsReteach) {
    feedback = 'You need more practice on a specific concept. Let\'s review it together.';
  } else if (canRetry) {
    const skillHint = missedOutcomes.length > 0 && config.immediateCorrectiveFeedback
      ? ` Focus on: ${missedOutcomes.join(', ')}.`
      : '';
    feedback = `You scored ${score}%. You need ${config.passPercent || 60}% to pass.${skillHint} Try again!`;
  } else {
    feedback = `You scored ${score}%. Review the lesson content and speak with your teacher.`;
  }

  return {
    passed,
    score,
    totalQuestions: total,
    correctCount: correct,
    missedOutcomes,
    needsReteach,
    reteachOutcome,
    feedback,
    canRetry,
  };
}

// ─── Evidence Recording ───

interface RecordEvidenceParams {
  studentId: string;
  skillId: string;
  sourceType: EvidenceSource;
  sourceId?: string;
  lessonId?: string;
  score: number;
  maxScore: number;
  confidence?: number;
}

/**
 * Record a piece of mastery evidence and recompute the student's skill state.
 * This is the primary entry point for the mastery engine.
 */
export async function recordEvidence(params: RecordEvidenceParams): Promise<void> {
  const { studentId, skillId, sourceType, sourceId, lessonId, score, maxScore, confidence } = params;
  const normalizedScore = maxScore > 0 ? score / maxScore : 0;

  // 1. Write evidence record
  await prisma.masteryEvidence.create({
    data: {
      studentId,
      skillId,
      sourceType,
      sourceId: sourceId || null,
      lessonId: lessonId || null,
      score,
      maxScore,
      normalizedScore,
      confidenceAtTime: confidence ?? null,
    },
  });

  // 2. Recompute mastery state
  await recomputeMasteryState(studentId, skillId);
}

// ─── Mastery State Computation ───

const HIGH_WEIGHT_SOURCES: EvidenceSource[] = ['MASTERY_CHECK', 'ASSIGNMENT', 'TEACHER_OBSERVATION'];
const RETRIEVAL_SOURCES: EvidenceSource[] = ['RETRIEVAL', 'MIXED_PRACTICE'];

/**
 * Recompute a student's mastery state for a given skill.
 * Uses weighted evidence scoring and true mastery rules.
 */
async function recomputeMasteryState(studentId: string, skillId: string): Promise<void> {
  // Fetch all evidence for this student+skill
  const evidence = await prisma.masteryEvidence.findMany({
    where: { studentId, skillId },
    orderBy: { submittedAt: 'asc' },
  });

  if (evidence.length === 0) return;

  // Fetch the skill to determine subject config
  const skill = await prisma.skill.findUnique({ where: { id: skillId } });
  if (!skill) return;

  const config = getSubjectConfig(skill.subject as SubjectMode);
  const weights = config.evidenceWeights;

  // Compute weighted average score
  let weightedSum = 0;
  let totalWeight = 0;
  for (const ev of evidence) {
    const w = weights[ev.sourceType] ?? 0.10;
    weightedSum += ev.normalizedScore * w;
    totalWeight += w;
  }
  const masteryScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

  // Check true mastery conditions
  const positiveEvidence = evidence.filter((e) => e.normalizedScore >= 0.70);
  const hasHighWeightSource = evidence.some((e) => HIGH_WEIGHT_SOURCES.includes(e.sourceType) && e.normalizedScore >= 0.70);
  const hasLaterRetrieval = evidence.some(
    (e, i) => RETRIEVAL_SOURCES.includes(e.sourceType) && e.normalizedScore >= 0.70 && i > 0
  );

  // Recent evidence check (last 3 items) for collapse detection
  const recentEvidence = evidence.slice(-3);
  const recentAvg = recentEvidence.reduce((s, e) => s + e.normalizedScore, 0) / recentEvidence.length;
  const hasCollapsePattern = evidence.length >= 3 && recentAvg < 0.50;

  // Consecutive success/failure counts from recent evidence
  let consecutiveSuccessCount = 0;
  let failedRetrievalCount = 0;
  for (let i = evidence.length - 1; i >= 0; i--) {
    if (evidence[i].normalizedScore >= 0.70) {
      consecutiveSuccessCount++;
    } else {
      break;
    }
  }
  for (const ev of evidence) {
    if (RETRIEVAL_SOURCES.includes(ev.sourceType) && ev.normalizedScore < 0.50) {
      failedRetrievalCount++;
    }
  }

  // Determine mastery state
  let masteryState: SkillMasteryState = 'NOT_INTRODUCED';
  const thresholds = config.masteryThresholds;

  if (
    masteryScore >= thresholds.mastered &&
    positiveEvidence.length >= config.minEvidenceForMastery &&
    (!config.requiresHighWeightEvidence || hasHighWeightSource) &&
    (!config.requiresLaterRetrieval || hasLaterRetrieval) &&
    !hasCollapsePattern
  ) {
    masteryState = 'MASTERED';
  } else if (hasCollapsePattern || failedRetrievalCount >= 3) {
    masteryState = 'NEEDS_SUPPORT';
  } else if (masteryScore >= thresholds.developing) {
    masteryState = 'DEVELOPING';
  } else if (masteryScore >= thresholds.practicing || evidence.length > 0) {
    masteryState = 'PRACTICING';
  }

  // Check for regression from MASTERED
  const existing = await prisma.studentSkillMastery.findUnique({
    where: { studentId_skillId: { studentId, skillId } },
  });
  if (existing?.masteryState === 'MASTERED' && masteryState !== 'MASTERED') {
    // Regression: was mastered, now weakened
    if (masteryState === 'NEEDS_SUPPORT') {
      // Keep as NEEDS_SUPPORT
    } else {
      masteryState = 'REVIEW_DUE';
    }
  }

  // Compute confidence average from recent evidence
  const evidenceWithConfidence = evidence.filter((e) => e.confidenceAtTime != null);
  const avgConfidence = evidenceWithConfidence.length > 0
    ? evidenceWithConfidence.reduce((s, e) => s + (e.confidenceAtTime ?? 0), 0) / evidenceWithConfidence.length
    : null;

  // Determine if teacher review is needed
  const needsTeacherReview =
    masteryState === 'NEEDS_SUPPORT' ||
    failedRetrievalCount >= 3 ||
    (avgConfidence !== null && avgConfidence >= 4 && masteryScore < 0.50); // high confidence + low performance

  // Compute next review date
  const nextReviewAt = computeNextReview(masteryState, consecutiveSuccessCount, avgConfidence);

  const lastEvidence = evidence[evidence.length - 1];

  // Upsert mastery record
  await prisma.studentSkillMastery.upsert({
    where: { studentId_skillId: { studentId, skillId } },
    update: {
      masteryState,
      masteryScore,
      confidenceScore: avgConfidence,
      lastEvidenceAt: lastEvidence.submittedAt,
      consecutiveSuccessCount,
      failedRetrievalCount,
      needsTeacherReview,
      nextReviewAt,
    },
    create: {
      studentId,
      skillId,
      masteryState,
      masteryScore,
      confidenceScore: avgConfidence,
      lastEvidenceAt: lastEvidence.submittedAt,
      consecutiveSuccessCount,
      failedRetrievalCount,
      helpRequestedCount: 0,
      needsTeacherReview,
      nextReviewAt,
    },
  });
}

// ─── Review Scheduling ───

const SPACING_INTERVALS_DAYS = [1, 3, 7, 14, 30];

function computeNextReview(
  state: SkillMasteryState,
  consecutiveSuccesses: number,
  confidence: number | null,
): Date | null {
  if (state === 'MASTERED') {
    // Even mastered skills get periodic review
    const intervalIdx = Math.min(consecutiveSuccesses, SPACING_INTERVALS_DAYS.length - 1);
    const days = SPACING_INTERVALS_DAYS[intervalIdx];
    return addDays(new Date(), days);
  }

  if (state === 'REVIEW_DUE' || state === 'DEVELOPING') {
    // Shorter intervals for skills needing consolidation
    const baseIdx = Math.min(Math.max(consecutiveSuccesses - 1, 0), 2);
    let days = SPACING_INTERVALS_DAYS[baseIdx];
    // Low confidence = even shorter
    if (confidence !== null && confidence <= 2) {
      days = Math.max(1, days - 1);
    }
    return addDays(new Date(), days);
  }

  if (state === 'NEEDS_SUPPORT') {
    return addDays(new Date(), 1); // daily review
  }

  // PRACTICING or NOT_INTRODUCED: no scheduled review yet
  return null;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// ─── Backward Compatibility ───

/**
 * Get skill IDs for a lesson, using LessonSkill mappings when available,
 * falling back to QuizQuestion.outcomeCode inference.
 */
export async function getSkillsForLesson(
  lessonId: string,
  relationship?: string,
): Promise<Array<{ skillId: string; code: string; relationshipType: string }>> {
  // Try LessonSkill first
  const mapped = await prisma.lessonSkill.findMany({
    where: {
      lessonId,
      ...(relationship ? { relationshipType: relationship as any } : {}),
    },
    include: { skill: { select: { code: true } } },
  });

  if (mapped.length > 0) {
    return mapped.map((m) => ({
      skillId: m.skillId,
      code: m.skill.code,
      relationshipType: m.relationshipType,
    }));
  }

  // Fallback: infer from QuizQuestion.outcomeCode
  const questions = await prisma.quizQuestion.findMany({
    where: { lessonId, outcomeCode: { not: null } },
    select: { outcomeCode: true },
    distinct: ['outcomeCode'],
  });

  const outcomeCodes = questions.map((q) => q.outcomeCode!).filter(Boolean);
  if (outcomeCodes.length === 0) return [];

  const skills = await prisma.skill.findMany({
    where: { code: { in: outcomeCodes } },
    select: { id: true, code: true },
  });

  return skills.map((s) => ({
    skillId: s.id,
    code: s.code,
    relationshipType: 'TARGET',
  }));
}

/**
 * Get skill IDs for an activity, using ActivitySkill when available,
 * falling back to parent lesson's target skills.
 */
export async function getSkillsForActivity(
  activityId: string,
  lessonId: string,
): Promise<Array<{ skillId: string; weight: number }>> {
  const mapped = await prisma.activitySkill.findMany({
    where: { activityId },
  });

  if (mapped.length > 0) {
    return mapped.map((m) => ({ skillId: m.skillId, weight: m.weight }));
  }

  // Fallback: inherit from lesson target skills
  const lessonSkills = await getSkillsForLesson(lessonId, 'TARGET');
  return lessonSkills.map((s) => ({ skillId: s.skillId, weight: 1.0 }));
}
