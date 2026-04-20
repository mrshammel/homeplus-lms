// ============================================
// AI Writing Feedback Service - Home Plus LMS
// ============================================
// Generates formative AI feedback on student written work.
// Uses Google Gemini for structured writing analysis.
// AI feedback is PROVISIONAL - teacher review is FINAL.

import { GoogleGenerativeAI } from '@google/generative-ai';

// ---------- Types ----------

export interface AiFeedbackResult {
  overallFeedback: string;
  strengths: string;
  areasForImprovement: string;
  nextSteps: string;
  provisionalScore: number | null;
  performanceLevel: 'EMERGING' | 'APPROACHING' | 'MEETING' | 'EXCEEDING';
  relevanceState: 'ON_TOPIC' | 'OFF_TOPIC' | 'GIBBERISH' | 'COPIED_PROMPT';
  modelVersion: string;
}

export interface AiFeedbackInput {
  writtenResponse: string;
  activityTitle: string;
  activityPrompt?: string;
  gradeLevel: number;
  maxScore?: number;
  submissionType: string;
  isPasted?: boolean;
  rubric?: { criterion: string; maxPoints: number }[];
}

// ---------- Constants ----------

const ELIGIBLE_TYPES = new Set([
  'SHORT_ANSWER',
  'PARAGRAPH_RESPONSE',
  'ESSAY',
  'REFLECTION',
]);

const MODEL_NAME = 'gemini-2.0-flash';

// ---------- Helpers ----------

/** Check if a submission type is eligible for AI feedback */
export function isEligibleForAiFeedback(submissionType: string): boolean {
  return ELIGIBLE_TYPES.has(submissionType);
}

/** Build the system prompt for formative writing feedback */
function buildSystemPrompt(input: AiFeedbackInput): string {
  const gradeDesc =
    input.gradeLevel <= 3
      ? `an early elementary student (Grade ${input.gradeLevel})`
      : input.gradeLevel <= 6
        ? `an upper elementary student (Grade ${input.gradeLevel})`
        : `a middle school student (Grade ${input.gradeLevel})`;

  let rubricSection = '';
  if (input.rubric && input.rubric.length > 0) {
    rubricSection = `\n\nRubric criteria for this assignment:\n${input.rubric.map((r) => `- ${r.criterion} (up to ${r.maxPoints} points)`).join('\n')}`;
  }

  // Submission-specific rubric logic
  let typeSpecificInstructions = '';
  switch (input.submissionType) {
    case 'SHORT_ANSWER':
      typeSpecificInstructions = '- Focus on directness, accuracy, and providing a single piece of evidence. Highly tolerant of spelling errors as long as the core concept is understood.';
      break;
    case 'PARAGRAPH_RESPONSE':
      typeSpecificInstructions = '- Focus on having a clear topic sentence, supporting details, and basic paragraph cohesion.';
      break;
    case 'ESSAY':
      typeSpecificInstructions = '- Focus on thesis clarity, structured arguments, transitions between paragraphs, and formal evidence.';
      break;
    case 'REFLECTION':
      typeSpecificInstructions = '- Focus strictly on metacognition, self-awareness, and personal connection to the material. Do NOT penalize strictly for spelling or formal sentence structure. Authentic effort is the goal here.';
      break;
    default:
      typeSpecificInstructions = '- Focus on completeness, clarity, organization, and evidence.';
  }

  let scoreInstruction = '';
  if (input.maxScore) {
    scoreInstruction = `\nAlso provide a provisional numeric score out of ${input.maxScore}. This is an estimate - the teacher will assign the final score.`;
  }

  const antiCheatWarning = input.isPasted 
    ? `\nCRITICAL FRAUD ALERT: The UI detected that the student copy-pasted this response instead of typing it. Unless the prompt explicitly asked them to copy something, you must flag this as COPIED_PROMPT.` 
    : ``;

  return `You are "Mrs. Hammel", a supportive, warm, and highly encouraging writing feedback assistant for ${gradeDesc} in an Alberta, Canada school. Your role is to provide formative feedback that helps the student grow.

Assignment: "${input.activityTitle}"
Submission type: ${input.submissionType}
${input.activityPrompt ? `Prompt: "${input.activityPrompt}"` : ''}${rubricSection}${antiCheatWarning}

--- GRADING CONSTRAINTS (RELEVANCE GATE) ---
Before providing feedback, evaluate the submission relevance. You must categorize it as one of:
- ON_TOPIC: Valid attempt to answer the prompt.
- OFF_TOPIC: A coherent response, but answers the wrong question entirely.
- GIBBERISH: Random characters, "idk", keyboard smashes, or nonsense.
- COPIED_PROMPT: The student pasted the prompt back or copy-pasted text from an external source (as flagged above).

If it is OFF_TOPIC, GIBBERISH, or COPIED_PROMPT:
- Score it a 0 (if scoring is requested).
- Performance level must be EMERGING.
- Overall feedback should politely point out why it wasn't accepted.
- Skip strengths and next steps (leave empty).

--- FEEDBACK TONE (MRS. HAMMEL PERSONA) ---
${typeSpecificInstructions}
- Be specific: Do NOT give generic praise like "Good job organizing your thoughts". Instead, prove you read it: "I liked how you organized your thoughts about the water cycle."
- Quote or reference a small specific piece of the student's text.
- Be honest but kind - acknowledge effort. Never be harsh, punitive, or robotic.
- Speak directly to the student in a conversational, teacher-like tone ("You've got a great start here...").${scoreInstruction}

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "relevanceState": "ON_TOPIC | OFF_TOPIC | GIBBERISH | COPIED_PROMPT",
  "overallFeedback": "2-3 sentence overall summary of the submission quality",
  "strengths": "2-3 specific things the student did well (empty if off-topic)",
  "areasForImprovement": "2-3 specific areas to improve, tying directly back to the prompt (empty if off-topic)",
  "nextSteps": "1-2 concrete, actionable revision suggestions (empty if off-topic)",
  "performanceLevel": "one of: EMERGING, APPROACHING, MEETING, EXCEEDING"${input.maxScore ? `,\n  "provisionalScore": <number from 0 to ${input.maxScore}>` : ''}
}`;
}

// ---------- Main Function ----------

/**
 * Generate AI formative feedback for student written work.
 * Returns structured feedback result or throws on error.
 */
export async function generateWritingFeedback(
  input: AiFeedbackInput
): Promise<AiFeedbackResult> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GOOGLE_GEMINI_API_KEY not configured');
  }

  if (!input.writtenResponse || input.writtenResponse.trim().length < 2) {
    throw new Error('Written response too short for meaningful feedback');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const systemPrompt = buildSystemPrompt(input);
  const userMessage = `Student's written response:\n\n${input.writtenResponse}`;

  const result = await model.generateContent({
    contents: [
      { role: 'user', parts: [{ text: `${systemPrompt}\n\n---\n\n${userMessage}` }] },
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json',
    },
  });

  const responseText = result.response.text();

  // Parse the JSON response
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    // Try to extract JSON from markdown code blocks if present
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[1].trim());
    } else {
      throw new Error(`Failed to parse AI response as JSON: ${responseText.slice(0, 200)}`);
    }
  }

  // Handle relevance states
  const validRelevance = ['ON_TOPIC', 'OFF_TOPIC', 'GIBBERISH', 'COPIED_PROMPT'];
  let relevance = String(parsed.relevanceState || 'ON_TOPIC').toUpperCase();
  if (!validRelevance.includes(relevance)) relevance = 'ON_TOPIC';

  // Validate and normalize the performance level
  const validLevels = ['EMERGING', 'APPROACHING', 'MEETING', 'EXCEEDING'];
  let level = String(parsed.performanceLevel || 'APPROACHING').toUpperCase();
  if (!validLevels.includes(level)) level = 'APPROACHING';

  // Enforce Relevance Gate constraints post-generation for safety
  let finalProvisionalScore: number | null = null;
  
  if (relevance !== 'ON_TOPIC') {
    level = 'EMERGING';
    if (input.maxScore !== undefined) {
      finalProvisionalScore = 0;
    }
  } else if (input.maxScore && parsed.provisionalScore !== undefined) {
    let rawScore = Number(parsed.provisionalScore);
    rawScore = Math.min(Math.max(0, rawScore), input.maxScore);
    finalProvisionalScore = Math.round(rawScore * 2) / 2; // Round to nearest 0.5
  }

  return {
    overallFeedback: String(parsed.overallFeedback || ''),
    strengths: String(parsed.strengths || ''),
    areasForImprovement: String(parsed.areasForImprovement || ''),
    nextSteps: String(parsed.nextSteps || ''),
    provisionalScore: finalProvisionalScore,
    performanceLevel: level as AiFeedbackResult['performanceLevel'],
    relevanceState: relevance as AiFeedbackResult['relevanceState'],
    modelVersion: MODEL_NAME,
  };
}
