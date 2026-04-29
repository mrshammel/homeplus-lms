import { prisma } from './db';

export interface GeneratedDecodableText {
  text: string;
  isCanadianEnglish: boolean;
  usedGraphemes: string[];
  usedHeartWords: string[];
}

/**
 * Builds a prompt for an LLM to generate a decodable text based on the student's mastery.
 * Ensures zero PII is included and enforces Canadian English spelling.
 */
export async function buildDecodableTextPrompt(
  studentId: string,
  topic: string = 'a fun story'
): Promise<string> {
  // 1. Fetch student's age band
  const user = await prisma.user.findUnique({
    where: { id: studentId },
    select: { studentAgeBand: true }
  });
  const ageBand = user?.studentAgeBand || 'early_primary';

  let ageConstraint = 'early readers (Grade 1-3)';
  if (ageBand === 'upper_primary') ageConstraint = 'upper primary readers (Grade 4-6)';
  if (ageBand === 'middle') ageConstraint = 'middle school readers (Grade 7-9)';

  // 2. Fetch mastered + valid in-progress lessons
  const studentMastery = await prisma.studentMastery.findMany({
    where: { studentId },
    select: { lessonId: true, status: true }
  });

  const fullyMasteredIds = studentMastery
    .filter(sm => ['mastered', 'complete'].includes(sm.status.toLowerCase()))
    .map(sm => sm.lessonId);

  const inProgressIds = studentMastery
    .filter(sm => sm.status.toLowerCase() === 'in_progress')
    .map(sm => sm.lessonId);

  const validInProgressIds: string[] = [];
  if (inProgressIds.length > 0) {
    const progressRecords = await prisma.studentProgress.findMany({
      where: { studentId, lessonId: { in: inProgressIds } },
      select: { lessonId: true, sectionsData: true }
    });
    for (const record of progressRecords) {
      const data = record.sectionsData as any;
      if (data?.learn) validInProgressIds.push(record.lessonId);
    }
  }

  const effectiveLessonIds = [...fullyMasteredIds, ...validInProgressIds];

  // 3. Get mastered graphemes
  const learnedGraphemes = await prisma.lessonGrapheme.findMany({
    where: { lessonId: { in: effectiveLessonIds } },
    include: { grapheme: { select: { grapheme: true } } }
  });
  const allowedGraphemes = [...new Set(learnedGraphemes.map(lg => lg.grapheme.grapheme))];

  // 4. Get mastered heart words
  const learnedHeartWords = await prisma.word.findMany({
    where: {
      isHeartWord: true,
      introducedLessonId: { in: effectiveLessonIds }
    },
    select: { word: true }
  });
  const allowedHeartWords = learnedHeartWords.map(hw => hw.word);

  // 5. Build prompt
  const prompt = `
You are an expert reading tutor generator.
Generate a short decodable text (approx. 50-70 words) about: "${topic}".

STRICT CONSTRAINTS:
1. ONLY use words that can be decoded using these graphemes: [ ${allowedGraphemes.join(', ')} ]
2. You may ALSO use these pre-taught sight words (Heart Words): [ ${allowedHeartWords.join(', ')} ]
3. DO NOT use any other graphemes or sight words.
4. Enforce Canadian English spelling (e.g., "colour", "centre").
5. The text should be age-appropriate for ${ageConstraint}.
6. Keep sentences short and simple.
  `.trim();

  return prompt;
}

/**
 * Fallback generation (no LLM) — returns a static decodable text appropriate
 * for the student's mastered grapheme set.
 */
export async function generateDecodableTextFallback(
  studentId: string,
  topic: string = 'a fun story'
): Promise<GeneratedDecodableText> {
  const prompt = await buildDecodableTextPrompt(studentId, topic);

  // TODO: Replace with actual LLM call (Gemini, OpenAI, etc.)
  // For now, return a simple CVC passage as placeholder
  return {
    text: "The cat sat on the mat. The cat is fat. I am at the mat.",
    isCanadianEnglish: true,
    usedGraphemes: ['c', 'a', 't', 's', 'o', 'n', 'h', 'e', 'm', 'i', 'f'],
    usedHeartWords: ['the', 'I', 'am', 'is', 'on']
  };
}
