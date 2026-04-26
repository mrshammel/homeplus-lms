import { prisma } from './db';

/**
 * Interface for the generated decodable text
 */
export interface GeneratedDecodableText {
  text: string;
  isCanadianEnglish: boolean;
  usedGraphemes: string[];
  usedHeartWords: string[];
}

/**
 * Builds a prompt for an LLM to generate a decodable text based on the student's mastery.
 * Ensures zero PII is included and enforces Canadian English spelling.
 * 
 * @param studentId The student's ID (used ONLY to fetch mastery, never sent to LLM)
 * @param topic An optional generic topic (e.g., "Write about a cat")
 * @returns The prompt to send to the LLM
 */
export async function buildDecodableTextPrompt(
  studentId: string,
  topic: string = 'a fun story'
): Promise<string> {
  // 1. Fetch student's age band from User model
  const user = await prisma.user.findUnique({
    where: { id: studentId },
    select: { studentAgeBand: true }
  });
  const ageBand = user?.studentAgeBand || 'early_primary';

  let ageConstraint = 'early readers (Grade 1-3)';
  if (ageBand === 'upper_primary') ageConstraint = 'upper primary readers (Grade 4-6) with slightly more mature themes';
  if (ageBand === 'middle') ageConstraint = 'middle school readers (Grade 7-9) with engaging, mature themes appropriate for older students';

  // 2. Fetch student mastery (no PII) and enforce pre-teaching gate
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
      if (data && data.learn) {
        validInProgressIds.push(record.lessonId);
      }
    }
  }

  const effectiveLessonIds = [...fullyMasteredIds, ...validInProgressIds];

  // 3. Get mastered graphemes
  const learnedGraphemes = await prisma.lessonGrapheme.findMany({
    where: { lessonId: { in: effectiveLessonIds } },
    include: { grapheme: true }
  });
  const allowedGraphemes = [...new Set(learnedGraphemes.map(lg => lg.grapheme.grapheme))];

  // 4. Get mastered heart words
  const learnedHeartWords = await prisma.word.findMany({
    where: {
      isHeartWord: true,
      introducedLessonId: { in: effectiveLessonIds }
    }
  });
  const allowedHeartWords = learnedHeartWords.map(hw => hw.word);

  // 4. Build prompt
  const prompt = `
You are an expert reading tutor generator. 
Generate a short decodable text (approx. 50-70 words) about: "${topic}".

STRICT CONSTRAINTS:
1. ONLY use words that can be decoded using the following graphemes:
   [ ${allowedGraphemes.join(', ')} ]
2. You may ALSO use the following pre-taught sight words (Heart Words):
   [ ${allowedHeartWords.join(', ')} ]
3. DO NOT use any other graphemes or sight words.
4. Enforce Canadian English spelling (e.g., "colour", "centre").
5. The text should be age-appropriate for ${ageConstraint}.
  `.trim();

  return prompt;
}

/**
 * Mock function to represent the LLM generation call.
 * In a real environment, this would call OpenAI, Anthropic, or Gemini.
 */
export async function generateDecodableTextFallback(
  studentId: string,
  topic: string = 'a fun story'
): Promise<GeneratedDecodableText> {
  const prompt = await buildDecodableTextPrompt(studentId, topic);
  
  // NOTE: This is where the actual LLM call would happen.
  // For now, we simulate a response.
  // console.log("Sending prompt to LLM:", prompt);

  return {
    text: "The cat sat on the mat. The cat is fat. I am at the mat.",
    isCanadianEnglish: true,
    usedGraphemes: ['c', 'a', 't', 's', 'o', 'n', 'h', 'e', 'm', 'i', 'f'],
    usedHeartWords: ['the', 'I', 'am']
  };
}
