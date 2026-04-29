import { prisma } from './db';

/**
 * Validates if a given text is 100% decodable for a specific student,
 * based on their current phonics mastery profile and the UFLI word bank.
 */
export async function validateContentIsDecodable(
  textContent: string,
  studentId: string
): Promise<{ isDecodable: boolean; isValid: boolean; invalidWords: string[] }> {
  // 1. Extract unique words from text (lowercase, strip punctuation)
  const words = textContent
    .toLowerCase()
    .replace(/[^\w\s']/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 0);

  const uniqueWords = [...new Set(words)];
  if (uniqueWords.length === 0) return { isDecodable: true, isValid: true, invalidWords: [] };

  // 2. Fetch student's mastered and in-progress lessons
  const studentMastery = await prisma.studentMastery.findMany({
    where: { studentId },
    select: { lessonId: true, status: true }
  });

  const fullyMasteredIds = studentMastery
    .filter(sm => ['mastered', 'complete'].includes(sm.status.toLowerCase()))
    .map(sm => sm.lessonId);

  const inProgressIds = studentMastery
    .filter(sm => ['in_progress'].includes(sm.status.toLowerCase()))
    .map(sm => sm.lessonId);

  // In-progress lessons are valid if the student has completed the 'learn' section
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

  // 3. Get all grapheme IDs the student has learned
  const learnedGraphemes = await prisma.lessonGrapheme.findMany({
    where: { lessonId: { in: effectiveLessonIds } },
    select: { graphemeId: true }
  });
  const learnedGraphemeIds = new Set(learnedGraphemes.map(lg => lg.graphemeId));

  // 4. Look up all words in the UFLI word bank
  const wordRecords = await prisma.word.findMany({
    where: { word: { in: uniqueWords } },
    include: { wordGraphemes: { select: { graphemeId: true } } }
  });
  const validWordMap = new Map(wordRecords.map(w => [w.word.toLowerCase(), w]));

  const invalidWords: string[] = [];

  for (const word of uniqueWords) {
    const record = validWordMap.get(word);

    // Word not in UFLI bank at all → invalid
    if (!record) {
      invalidWords.push(word);
      continue;
    }

    // Heart words: valid only if introduced in a lesson the student has covered
    if (record.isHeartWord) {
      if (!record.introducedLessonId || !effectiveLessonIds.includes(record.introducedLessonId)) {
        invalidWords.push(word);
      }
      continue;
    }

    // Decodable words: ALL constituent graphemes must be learned
    const hasUnlearnedGrapheme = record.wordGraphemes.some(
      wg => !learnedGraphemeIds.has(wg.graphemeId)
    );
    if (hasUnlearnedGrapheme) {
      invalidWords.push(word);
    }
  }

  const isDecodable = invalidWords.length === 0;
  return { isDecodable, isValid: isDecodable, invalidWords };
}
