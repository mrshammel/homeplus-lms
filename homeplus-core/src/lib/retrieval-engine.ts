// ============================================
// Retrieval Engine — Home Plus LMS
// ============================================
// Generates warm-up retrieval question sets for lessons.
// Sources questions from the QuizQuestion bank, linked to skills
// via LessonSkill and ActivitySkill.
//
// Sourcing rules per lesson:
//   2 from current/recent unit skills
//   2 from older previously learned skills
//   1 from prerequisite or fragile skills

import { prisma } from '@/lib/db';

// ─── Types ───

export interface RetrievalItem {
  questionId: string;
  skillId: string;
  skillCode: string;
  sourceLessonId: string;
  sourceUnitId: string;
  difficulty: number;
  itemType: string;
  evidenceWeight: number;
  questionText: string;
  options: any;
  correctAnswer: string | null;
}

// ─── Main Generator ───

/**
 * Generate a retrieval set for a lesson's warm-up.
 * Falls back gracefully if no skills are mapped.
 *
 * @param studentId - Student to personalize for
 * @param currentLessonId - The lesson being loaded
 * @param count - Total items to return (default 5)
 * @returns Array of retrieval items ready for rendering
 */
export async function generateRetrievalSet(
  studentId: string,
  currentLessonId: string,
  count: number = 5,
): Promise<RetrievalItem[]> {
  // Get the current lesson's unit and subject context
  const currentLesson = await prisma.lesson.findUnique({
    where: { id: currentLessonId },
    include: {
      unit: { include: { subject: true } },
    },
  });
  if (!currentLesson) return [];

  const subjectId = currentLesson.unit.subjectId;
  const currentUnitId = currentLesson.unitId;

  // Get all units for this subject, ordered
  const allUnits = await prisma.unit.findMany({
    where: { subjectId },
    orderBy: { order: 'asc' },
    select: { id: true, order: true },
  });
  const currentUnitOrder = allUnits.find((u) => u.id === currentUnitId)?.order ?? 0;

  // Get student's mastery data for prioritizing fragile skills
  const studentMastery = await prisma.studentSkillMastery.findMany({
    where: { studentId },
    select: { skillId: true, masteryState: true, failedRetrievalCount: true },
  });
  const masteryMap = new Map(studentMastery.map((m) => [m.skillId, m]));

  // === Bucket 1: Current/recent unit skills (2 items) ===
  const recentUnitIds = allUnits
    .filter((u) => u.order <= currentUnitOrder && u.order >= currentUnitOrder - 1)
    .map((u) => u.id);

  const recentQuestions = await findQuestionsFromUnits(recentUnitIds, currentLessonId);

  // === Bucket 2: Older previously learned skills (2 items) ===
  const olderUnitIds = allUnits
    .filter((u) => u.order < currentUnitOrder - 1)
    .map((u) => u.id);

  const olderQuestions = await findQuestionsFromUnits(olderUnitIds, currentLessonId);

  // === Bucket 3: Prerequisite or fragile skills (1 item) ===
  const fragileSkillIds = studentMastery
    .filter((m) =>
      m.masteryState === 'NEEDS_SUPPORT' ||
      m.masteryState === 'REVIEW_DUE' ||
      m.failedRetrievalCount >= 2
    )
    .map((m) => m.skillId);

  const prerequisiteSkills = await prisma.lessonSkill.findMany({
    where: {
      lessonId: currentLessonId,
      relationshipType: 'PREREQUISITE',
    },
    select: { skillId: true },
  });
  const prereqSkillIds = prerequisiteSkills.map((p) => p.skillId);

  const fragileAndPrereqIds = [...new Set([...fragileSkillIds, ...prereqSkillIds])];
  const fragileQuestions = fragileAndPrereqIds.length > 0
    ? await findQuestionsBySkillIds(fragileAndPrereqIds)
    : [];

  // === Assemble retrieval set ===
  const result: RetrievalItem[] = [];
  const usedIds = new Set<string>();

  // Pick 2 from recent
  pickItems(recentQuestions, 2, result, usedIds, 0.20);
  // Pick 2 from older
  pickItems(olderQuestions, 2, result, usedIds, 0.20);
  // Pick 1 from fragile/prerequisite
  pickItems(fragileQuestions, 1, result, usedIds, 0.25);

  // If we didn't fill all slots, backfill from any available
  if (result.length < count) {
    const allAvailable = [...recentQuestions, ...olderQuestions, ...fragileQuestions];
    pickItems(allAvailable, count - result.length, result, usedIds, 0.15);
  }

  return result.slice(0, count);
}

// ─── Helpers ───

interface RawQuestion {
  id: string;
  questionText: string;
  questionType: string;
  options: any;
  correctAnswer: string | null;
  difficulty: number;
  outcomeCode: string | null;
  lessonId: string;
  lesson: { unitId: string };
}

async function findQuestionsFromUnits(
  unitIds: string[],
  excludeLessonId: string,
): Promise<RawQuestion[]> {
  if (unitIds.length === 0) return [];

  return prisma.quizQuestion.findMany({
    where: {
      lesson: { unitId: { in: unitIds } },
      lessonId: { not: excludeLessonId },
    },
    include: { lesson: { select: { unitId: true } } },
    orderBy: { difficulty: 'asc' },
    take: 20, // fetch pool, then we pick from it
  }) as any;
}

async function findQuestionsBySkillIds(skillIds: string[]): Promise<RawQuestion[]> {
  // Find questions linked to these skills via outcomeCode matching skill.code
  const skills = await prisma.skill.findMany({
    where: { id: { in: skillIds } },
    select: { code: true },
  });
  const codes = skills.map((s) => s.code);
  if (codes.length === 0) return [];

  return prisma.quizQuestion.findMany({
    where: { outcomeCode: { in: codes } },
    include: { lesson: { select: { unitId: true } } },
    take: 10,
  }) as any;
}

function pickItems(
  pool: RawQuestion[],
  count: number,
  result: RetrievalItem[],
  usedIds: Set<string>,
  evidenceWeight: number,
): void {
  // Shuffle for variety
  const shuffled = [...pool].sort(() => Math.random() - 0.5);

  for (const q of shuffled) {
    if (result.length >= result.length + count) break;
    if (usedIds.has(q.id)) continue;

    usedIds.add(q.id);
    result.push({
      questionId: q.id,
      skillId: '', // filled by caller if needed
      skillCode: q.outcomeCode || '',
      sourceLessonId: q.lessonId,
      sourceUnitId: q.lesson.unitId,
      difficulty: q.difficulty,
      itemType: q.questionType,
      evidenceWeight,
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
    });

    if (result.length >= count && usedIds.size > pool.length / 2) break;
  }
}
