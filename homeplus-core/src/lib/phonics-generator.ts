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

  // 2. Fetch student mastery using StudentMastery model
  const studentMastery = await prisma.studentMastery.findMany({
    where: { studentId },
    select: { lessonId: true, status: true }
  });

  const masteredLessonIds = studentMastery
    .filter(sm => ['mastered', 'complete'].includes(sm.status.toLowerCase()))
    .map(sm => sm.lessonId);

  // 3. Grapheme/heart word lookups are stubs until curriculum models are built
  // TODO: Add LessonGrapheme and Word (HeartWord) models to schema
  const allowedGraphemes: string[] = [];
  const allowedHeartWords: string[] = [];

  // 4. Build prompt
  const prompt = `
You are an expert reading tutor generator. 
Generate a short decodable text (approx. 50-70 words) about: "${topic}".

STRICT CONSTRAINTS:
1. ONLY use common CVC and CCVC patterns appropriate for ${ageConstraint}.
2. Enforce Canadian English spelling (e.g., "colour", "centre").
3. The text should be age-appropriate for ${ageConstraint}.
4. Student has mastered ${masteredLessonIds.length} phonics lessons.
${allowedGraphemes.length > 0 ? `5. Prefer graphemes: [ ${allowedGraphemes.join(', ')} ]` : ''}
${allowedHeartWords.length > 0 ? `6. Sight words available: [ ${allowedHeartWords.join(', ')} ]` : ''}
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
