import { prisma } from './db';

/**
 * Validates if a given text is 100% decodable for a specific student,
 * based on their current phonics mastery profile and the UFLI word bank.
 */
export async function validateContentIsDecodable(
  textContent: string,
  studentId: string
): Promise<{ isDecodable: boolean; invalidWords: string[] }> {
  // 1. Extract unique words from text (lowercase, strip punctuation)
  const words = textContent
    .toLowerCase()
    .replace(/[^\w\s']/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 0);

  const uniqueWords = [...new Set(words)];
  if (uniqueWords.length === 0) return { isDecodable: true, invalidWords: [] };

  // 2. Fetch the set of grapheme IDs the student has learned
  const studentMastery = await prisma.phonicsMastery.findMany({
    where: { studentId: studentId },
    select: { lessonId: true, status: true }
  });
  
  const fullyMasteredIds = studentMastery
    .filter(sm => ['MASTERED', 'COMPLETE', 'mastered', 'complete'].includes(sm.status))
    .map(sm => sm.lessonId);
    
  const inProgressIds = studentMastery
    .filter(sm => ['IN_PROGRESS', 'in_progress'].includes(sm.status))
    .map(sm => sm.lessonId);

  const validInProgressIds: string[] = [];
  if (inProgressIds.length > 0) {
    const progressRecords = await prisma.studentProgress.findMany({
      where: {
        studentId: studentId,
        lessonId: { in: inProgressIds }
      },
      select: { lessonId: true, sectionsData: true }
    });
    
    for (const record of progressRecords) {
      const data = record.sectionsData as any;
      // Step 6 (Heart Words) and Step 4 (Grapheme Intro) are in the 'learn' section.
      // If the 'learn' section is completed, they can read Decodable Texts (Step 7) using them.
      if (data && data.learn) {
        validInProgressIds.push(record.lessonId);
      }
    }
  }

  const effectiveLessonIds = [...fullyMasteredIds, ...validInProgressIds];

  // If the student hasn't mastered any lessons, they can't decode anything except possibly early sight words
  // But let's fetch the graphemes anyway
  const learnedGraphemes = await prisma.lessonGrapheme.findMany({
    where: {
      lessonId: { in: effectiveLessonIds }
    },
    select: { graphemeId: true }
  });

  const learnedGraphemeIds = new Set(learnedGraphemes.map(lg => lg.graphemeId));

  // 3. Look up all the unique words in the central validated word bank
  const wordRecords = await prisma.word.findMany({
    where: {
      word: { in: uniqueWords }
    },
    include: {
      wordGraphemes: true
    }
  });

  const validWordMap = new Map(wordRecords.map(w => [w.word.toLowerCase(), w]));
  const invalidWords: string[] = [];

  for (const word of uniqueWords) {
    const record = validWordMap.get(word);
    
    // If the word isn't even in our validated UFLI word bank, it's invalid.
    if (!record) {
      invalidWords.push(word);
      continue;
    }

    // Heart words (sight words) introduced in lessons the student has covered are valid
    if (record.isHeartWord) {
      if (!record.introducedLessonId || !effectiveLessonIds.includes(record.introducedLessonId)) {
         invalidWords.push(word);
      }
      continue;
    }

    // For decodable words, ALL of its graphemes must be in the learnedGraphemeIds set
    const hasUnlearnedGrapheme = record.wordGraphemes.some(
      (wg) => !learnedGraphemeIds.has(wg.graphemeId)
    );

    if (hasUnlearnedGrapheme) {
      invalidWords.push(word);
    }
  }

  return {
    isDecodable: invalidWords.length === 0,
    invalidWords
  };
}
