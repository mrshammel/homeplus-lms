import { prisma } from './db';

/**
 * Validates if a given text is 100% decodable for a specific student,
 * based on their current phonics mastery profile and the UFLI word bank.
 *
 * NOTE: LessonGrapheme and Word models are not yet implemented in the schema.
 * This function currently returns permissive (all-decodable) until those
 * curriculum models are built out.
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

  // 2. Fetch the set of lessons the student has mastered
  const studentMastery = await prisma.studentMastery.findMany({
    where: { studentId },
    select: { lessonId: true, status: true }
  });

  const masteredLessonIds = studentMastery
    .filter(sm => ['mastered', 'complete'].includes(sm.status.toLowerCase()))
    .map(sm => sm.lessonId);

  // TODO: Once LessonGrapheme and Word (UFLI curriculum) models are added to the schema,
  // implement full grapheme-based decodability validation here.
  // For now, return permissive result — content is treated as decodable if the student
  // has at least started phonics lessons.
  if (masteredLessonIds.length === 0) {
    // No mastery yet — flag a sample of words as potentially invalid
    return { isDecodable: false, invalidWords: uniqueWords.slice(0, 5) };
  }

  return {
    isDecodable: true,
    invalidWords: []
  };
}
