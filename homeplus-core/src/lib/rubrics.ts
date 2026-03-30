// ============================================
// Shared Rubric & Feedback Framework — Home Plus LMS
// ============================================
// Provides reusable rubric templates, subject calibration,
// feedback philosophy, and AI prompt builders for consistent
// AI-first marking across all subjects and grade levels.

import type { SubjectMode } from './lesson-types';

// ============ FEEDBACK PHILOSOPHY ============

/** Core feedback rules applied to ALL AI-generated feedback. */
export const FEEDBACK_PHILOSOPHY = {
  tone: 'encouraging, specific, revision-oriented, student-friendly',
  structure: [
    'What the student did well (1-2 specific strengths)',
    'What needs improvement (1-2 actionable items)',
    'One clear next step',
  ],
  avoid: [
    'Vague praise with no substance',
    'Overly punitive or harsh language',
    'Jargon-heavy wording above the student grade level',
    'Fake cheerleading with no instructional value',
    'Excessively long feedback for small tasks',
    'Robotic or template-sounding language',
  ],
  maxWords: {
    smallTask: 80,
    mediumTask: 120,
    largeTask: 180,
  },
} as const;

export const DISCLAIMER =
  'This is AI-generated feedback to help you improve. Your final grade will be reviewed and assigned by your teacher.';

// ============ SCORING BANDS ============

export interface ScoringBand {
  min: number;
  max: number;
  label: string;
  descriptor: string;
}

export const SCORING_BANDS: ScoringBand[] = [
  { min: 90, max: 100, label: 'Excellent', descriptor: 'Thorough, accurate, and well-explained' },
  { min: 75, max: 89,  label: 'Good',      descriptor: 'Mostly complete with minor gaps' },
  { min: 60, max: 74,  label: 'Developing', descriptor: 'Basic understanding, needs more depth' },
  { min: 40, max: 59,  label: 'Beginning',  descriptor: 'Partial understanding, significant gaps' },
  { min: 0,  max: 39,  label: 'Incomplete', descriptor: 'Major content missing or incorrect' },
];

export function getScoringBand(score: number): ScoringBand {
  return SCORING_BANDS.find((b) => score >= b.min && score <= b.max) || SCORING_BANDS[4];
}

// ============ RUBRIC TASK TYPES ============

export type RubricTaskType =
  | 'QUIZ'
  | 'SHORT_EXPLANATION'
  | 'CONSTRUCTED_RESPONSE'
  | 'PROJECT'
  | 'WRITING';

export interface RubricCriterion {
  name: string;
  weight: number;      // 0-100, all criteria should sum to 100
  description: string; // what this criterion measures
  indicators: {
    strong: string;
    developing: string;
    weak: string;
  };
}

export interface RubricTemplate {
  taskType: RubricTaskType;
  criteria: RubricCriterion[];
}

// ─── A. Quiz / Objective Checks ───
const QUIZ_RUBRIC: RubricTemplate = {
  taskType: 'QUIZ',
  criteria: [
    {
      name: 'Correctness',
      weight: 80,
      description: 'Answer matches the correct response',
      indicators: {
        strong: 'Correct answer selected/provided',
        developing: 'Partially correct or close',
        weak: 'Incorrect response',
      },
    },
    {
      name: 'Concept Alignment',
      weight: 20,
      description: 'Response demonstrates understanding of the underlying concept',
      indicators: {
        strong: 'Shows clear conceptual understanding',
        developing: 'Shows partial understanding',
        weak: 'Reflects misconception',
      },
    },
  ],
};

// ─── B. Short Explanation / Science Reasoning ───
const SHORT_EXPLANATION_RUBRIC: RubricTemplate = {
  taskType: 'SHORT_EXPLANATION',
  criteria: [
    {
      name: 'Concept Accuracy',
      weight: 35,
      description: 'Scientific/subject concepts are correctly stated',
      indicators: {
        strong: 'All key concepts are accurate and precise',
        developing: 'Most concepts correct, minor inaccuracies',
        weak: 'Significant errors or misconceptions',
      },
    },
    {
      name: 'Completeness',
      weight: 25,
      description: 'All required parts of the prompt are addressed',
      indicators: {
        strong: 'All parts addressed thoroughly',
        developing: 'Most parts addressed, some gaps',
        weak: 'Major parts of the prompt not addressed',
      },
    },
    {
      name: 'Evidence & Examples',
      weight: 25,
      description: 'Uses specific examples, evidence, or references from the lesson',
      indicators: {
        strong: 'Uses specific lesson examples and evidence',
        developing: 'Some examples but could be more specific',
        weak: 'No examples or evidence provided',
      },
    },
    {
      name: 'Clarity',
      weight: 15,
      description: 'Explanation is clear and easy to follow',
      indicators: {
        strong: 'Clear, well-organized explanation',
        developing: 'Understandable but could be clearer',
        weak: 'Confusing or hard to follow',
      },
    },
  ],
};

// ─── C. Constructed Response / Paragraph ───
const CONSTRUCTED_RESPONSE_RUBRIC: RubricTemplate = {
  taskType: 'CONSTRUCTED_RESPONSE',
  criteria: [
    {
      name: 'Idea Development',
      weight: 30,
      description: 'Ideas are developed with depth and detail',
      indicators: {
        strong: 'Well-developed ideas with specific detail',
        developing: 'Ideas present but need more development',
        weak: 'Ideas are vague or undeveloped',
      },
    },
    {
      name: 'Accuracy & Relevance',
      weight: 30,
      description: 'Content is accurate and directly addresses the prompt',
      indicators: {
        strong: 'Accurate, relevant, and on-topic throughout',
        developing: 'Mostly accurate with minor drifts',
        weak: 'Inaccurate or off-topic',
      },
    },
    {
      name: 'Organization',
      weight: 20,
      description: 'Response has logical flow and structure',
      indicators: {
        strong: 'Clear structure with logical progression',
        developing: 'Some organization but jumps between ideas',
        weak: 'No discernible organization',
      },
    },
    {
      name: 'Evidence & Support',
      weight: 20,
      description: 'Claims are supported with evidence or examples',
      indicators: {
        strong: 'Strong evidence from lesson content',
        developing: 'Some support but could be stronger',
        weak: 'No supporting evidence',
      },
    },
  ],
};

// ─── D. Project / Performance Task ───
const PROJECT_RUBRIC: RubricTemplate = {
  taskType: 'PROJECT',
  criteria: [
    {
      name: 'Outcome Alignment',
      weight: 25,
      description: 'Work demonstrates the intended learning outcomes',
      indicators: {
        strong: 'Clearly demonstrates all target outcomes',
        developing: 'Demonstrates some outcomes, gaps remain',
        weak: 'Outcomes not clearly demonstrated',
      },
    },
    {
      name: 'Completeness',
      weight: 25,
      description: 'All required components are present',
      indicators: {
        strong: 'All required parts complete and thorough',
        developing: 'Most parts present, some incomplete',
        weak: 'Major components missing',
      },
    },
    {
      name: 'Accuracy & Depth',
      weight: 25,
      description: 'Content is accurate and shows depth of understanding',
      indicators: {
        strong: 'Deep understanding, accurate throughout',
        developing: 'Basic understanding, some errors',
        weak: 'Surface-level or inaccurate',
      },
    },
    {
      name: 'Communication Quality',
      weight: 25,
      description: 'Ideas are communicated clearly and effectively',
      indicators: {
        strong: 'Clear, well-organized, effective format',
        developing: 'Understandable but could be clearer',
        weak: 'Unclear or disorganized',
      },
    },
  ],
};

// ─── E. Writing-Heavy Tasks ───
const WRITING_RUBRIC: RubricTemplate = {
  taskType: 'WRITING',
  criteria: [
    {
      name: 'Ideas & Content',
      weight: 30,
      description: 'Strength and clarity of central idea and supporting details',
      indicators: {
        strong: 'Clear central idea with strong supporting detail',
        developing: 'Central idea present but needs more support',
        weak: 'No clear central idea',
      },
    },
    {
      name: 'Organization',
      weight: 20,
      description: 'Logical structure with transitions',
      indicators: {
        strong: 'Strong beginning, middle, end with transitions',
        developing: 'Some structure but transitions are weak',
        weak: 'No clear structure',
      },
    },
    {
      name: 'Evidence & Support',
      weight: 20,
      description: 'Use of specific evidence, examples, or details',
      indicators: {
        strong: 'Specific, relevant evidence throughout',
        developing: 'Some evidence but could be more specific',
        weak: 'Little or no evidence',
      },
    },
    {
      name: 'Language & Conventions',
      weight: 15,
      description: 'Grammar, spelling, and word choice',
      indicators: {
        strong: 'Clear language, minimal errors',
        developing: 'Some errors but meaning is clear',
        weak: 'Errors interfere with meaning',
      },
    },
    {
      name: 'Audience & Purpose',
      weight: 15,
      description: 'Writing fits the audience and task purpose',
      indicators: {
        strong: 'Tone and style match audience and purpose',
        developing: 'Partially appropriate for audience',
        weak: 'Does not fit audience or purpose',
      },
    },
  ],
};

const RUBRIC_TEMPLATES: Record<RubricTaskType, RubricTemplate> = {
  QUIZ: QUIZ_RUBRIC,
  SHORT_EXPLANATION: SHORT_EXPLANATION_RUBRIC,
  CONSTRUCTED_RESPONSE: CONSTRUCTED_RESPONSE_RUBRIC,
  PROJECT: PROJECT_RUBRIC,
  WRITING: WRITING_RUBRIC,
};

export function getRubricTemplate(taskType: RubricTaskType): RubricTemplate {
  return RUBRIC_TEMPLATES[taskType];
}

// ============ SUBJECT CALIBRATION ============

export interface SubjectCalibration {
  priorities: string[];          // ordered list of what matters most
  vocabularyExpectations: string;
  reasoningExpectation: string;
  evidenceExpectation: string;
}

const SUBJECT_CALIBRATIONS: Record<SubjectMode, SubjectCalibration> = {
  SCIENCE: {
    priorities: [
      'Concept accuracy',
      'Explanation of relationships and systems',
      'Use of scientific vocabulary',
      'Reasoning and evidence from observations/data',
      'Application to specific scenarios or models',
    ],
    vocabularyExpectations: 'Uses scientific terminology accurately (e.g., ecosystem, organism, energy transfer, photosynthesis). Vocabulary should come from the lesson, not generic language.',
    reasoningExpectation: 'Explains cause-and-effect relationships, describes how parts of a system interact, and uses evidence from the lesson or observations.',
    evidenceExpectation: 'References specific examples, diagrams, data, or models from the lesson. Generic answers without lesson-specific evidence score lower.',
  },
  MATH: {
    priorities: [
      'Mathematical correctness',
      'Process and strategy shown',
      'Explanation of thinking where required',
      'Completeness of solution',
    ],
    vocabularyExpectations: 'Uses appropriate mathematical terms. Shows understanding of operations, relationships, and properties.',
    reasoningExpectation: 'Shows clear steps in solving. Explains why a strategy was chosen. Justifies answers with mathematical reasoning.',
    evidenceExpectation: 'Shows work and calculations. References specific mathematical principles or properties.',
  },
  ELA: {
    priorities: [
      'Comprehension or interpretation accuracy',
      'Evidence and textual support',
      'Organization and clarity of ideas',
      'Language conventions',
      'Revision quality for draft tasks',
    ],
    vocabularyExpectations: 'Uses precise language appropriate to the task. Literary/analytical vocabulary where applicable (e.g., theme, inference, evidence, perspective).',
    reasoningExpectation: 'Makes inferences supported by text. Analyzes rather than just summarizes. Connects ideas logically.',
    evidenceExpectation: 'Uses direct quotes or specific textual references. Explains how evidence supports the claim.',
  },
  SOCIAL_STUDIES: {
    priorities: [
      'Factual and contextual accuracy',
      'Evidence-based explanation',
      'Comparison and analysis',
      'Historical or geographic reasoning',
      'Perspective or argument quality',
    ],
    vocabularyExpectations: 'Uses accurate historical/geographic terminology. References specific events, people, places, or concepts from the lesson.',
    reasoningExpectation: 'Explains cause and effect in historical/geographic context. Compares perspectives or analyzes change over time.',
    evidenceExpectation: 'References specific facts, events, or sources from the lesson. Supports claims with lesson-specific evidence.',
  },
  GENERAL: {
    priorities: [
      'Accuracy and relevance',
      'Completeness',
      'Clear explanation',
      'Use of key vocabulary',
    ],
    vocabularyExpectations: 'Uses key vocabulary from the lesson accurately.',
    reasoningExpectation: 'Explains thinking clearly. Shows understanding of the topic.',
    evidenceExpectation: 'References specific content from the lesson.',
  },
};

export function getSubjectCalibration(subject: SubjectMode): SubjectCalibration {
  return SUBJECT_CALIBRATIONS[subject] || SUBJECT_CALIBRATIONS.GENERAL;
}

// ============ GRADE-LEVEL TONE ============

export interface GradeTone {
  maxFeedbackSentences: number;
  complexity: 'simple' | 'moderate' | 'standard';
  style: string;
}

export function getGradeTone(gradeLevel: number): GradeTone {
  if (gradeLevel <= 3) {
    return {
      maxFeedbackSentences: 3,
      complexity: 'simple',
      style: 'Use very simple, short sentences. Be warm and encouraging. Use emojis sparingly. Keep vocabulary at grade 2-3 level.',
    };
  }
  if (gradeLevel <= 6) {
    return {
      maxFeedbackSentences: 4,
      complexity: 'moderate',
      style: 'Use clear, direct sentences. Be encouraging but specific. Avoid jargon. Keep vocabulary at grade 5-6 level.',
    };
  }
  return {
    maxFeedbackSentences: 5,
    complexity: 'standard',
    style: 'Use clear, professional language appropriate for a middle schooler. Be respectful and constructive. Can use subject vocabulary students have learned.',
  };
}

// ============ RESOLVE RUBRIC ============

/**
 * Derive the appropriate rubric for a constructed-response block
 * based on content flags and subject mode.
 */
export function resolveRubricType(
  teacherReviewRequired?: boolean,
  minLength?: number,
): RubricTaskType {
  if (teacherReviewRequired) return 'PROJECT';
  if (minLength && minLength >= 100) return 'CONSTRUCTED_RESPONSE';
  return 'SHORT_EXPLANATION';
}

// ============ AI PROMPT BUILDER ============

/**
 * Build a calibrated AI prompt for the Gemini API using the
 * rubric framework, subject calibration, and grade tone.
 */
export function buildAIPrompt(opts: {
  subject: SubjectMode;
  gradeLevel: number;
  rubricType: RubricTaskType;
  rubricHint: string;
  teacherReviewRequired: boolean;
}): string {
  const { subject, gradeLevel, rubricType, rubricHint, teacherReviewRequired } = opts;
  const template = getRubricTemplate(rubricType);
  const cal = getSubjectCalibration(subject);
  const tone = getGradeTone(gradeLevel);

  const subjectName = {
    SCIENCE: 'Science', MATH: 'Math', ELA: 'English Language Arts',
    SOCIAL_STUDIES: 'Social Studies', GENERAL: 'the subject',
  }[subject];

  const criteriaText = template.criteria
    .map((c) => `- ${c.name} (${c.weight}%): ${c.description}. Strong = ${c.indicators.strong}. Weak = ${c.indicators.weak}.`)
    .join('\n');

  return `You are a supportive Grade ${gradeLevel} ${subjectName} teacher providing formative feedback.

CRITICAL — RELEVANCE GATE (evaluate FIRST):
Before scoring, determine if the student's response ADDRESSES THE PROMPT.
- If the response is off-topic, nonsensical, random characters, or does not attempt to answer the question asked, the score MUST be 0-10 regardless of length, vocabulary, or writing quality.
- If the response copies the prompt back without adding original thought, score 5-15.
- A well-written response about the WRONG TOPIC scores 5-15, not 40+.
- Only score above 15 if the response genuinely attempts to answer what was asked.

FEEDBACK PHILOSOPHY:
- Be encouraging and specific — what they did well FIRST
- Be concise — ${tone.maxFeedbackSentences} sentences max for the summary
- Give 1-2 specific strengths (reference their actual words)
- Give 1-2 actionable improvements (not vague)
- Give exactly 1 clear next step the student can act on
- ${tone.style}

ANTI-PATTERNS — do NOT do these:
- Do NOT give 40+ to a response that does not address the prompt
- Do NOT list "You attempted the response" as a strength — that is not a strength
- Do NOT inflate scores because the student wrote many words
- Do NOT deflate scores for short responses IF they are accurate, specific, and complete
- Do NOT give vague feedback like "good job" — reference specific words the student used
- Do NOT be overly generous — a mediocre response should score 45-60, not 70+

SUBJECT PRIORITIES FOR ${subjectName.toUpperCase()}:
${cal.priorities.map((p) => `- ${p}`).join('\n')}

VOCABULARY EXPECTATIONS: ${cal.vocabularyExpectations}
EVIDENCE EXPECTATIONS: ${cal.evidenceExpectation}

RUBRIC CRITERIA (${rubricType}):
${criteriaText}

${rubricHint ? `TASK-SPECIFIC RUBRIC HINT:\n${rubricHint}` : ''}

SCORING CALIBRATION (Grade ${gradeLevel}):
- 85-100 Excellent: Directly answers the prompt with specific evidence from the lesson. Uses key vocabulary correctly. Shows original thinking beyond restated definitions.
- 65-84 Good: Addresses the prompt with some evidence or specificity. Good effort with room for more depth or precision.
- 45-64 Developing: Partially addresses the prompt but is vague, lacks evidence, or shows only surface-level understanding. May be missing key parts of what was asked.
- 20-44 Beginning: Attempts the topic but has major gaps, misconceptions, or minimal relevant content.
- 5-19 Minimal: Off-topic, copies the prompt back, or barely engages with the question.
- 0-4 Non-attempt: Gibberish, blank, or completely unrelated content.

AUTHENTIC LEARNING:
- Reward lesson-specific evidence and original thinking
- Generic or vague answers should score lower
- Student-created examples/explanations matter more than restated definitions

${teacherReviewRequired ? 'NOTE: This is a major assignment that will also be reviewed by the teacher. Help the student revise before final submission.' : ''}

Respond ONLY with valid JSON:
{
  "score": <number 0-100>,
  "relevanceScore": <number 0-100, how well does the response address what was asked>,
  "flagForTeacher": <true if score is borderline (30-55) or response quality is ambiguous>,
  "feedback": "<${tone.maxFeedbackSentences} sentence summary>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>"],
  "nextStep": "<one specific action the student should do next>",
  "criteriaScores": {${template.criteria.map((c) => `"${c.name}": <0-100>`).join(', ')}}
}`;
}

// ============ FALLBACK SCORING ============

/** Subject-agnostic vocabulary lists for fallback scoring. */
const SUBJECT_VOCAB: Record<SubjectMode, string[]> = {
  SCIENCE: [
    'ecosystem', 'biotic', 'abiotic', 'producer', 'consumer', 'decomposer',
    'food chain', 'food web', 'predator', 'prey', 'symbiosis', 'mutualism',
    'commensalism', 'parasitism', 'competition', 'population', 'community',
    'habitat', 'niche', 'biodiversity', 'species', 'organism',
    'photosynthesis', 'energy', 'trophic', 'herbivore', 'carnivore', 'omnivore',
    'succession', 'invasive', 'endangered', 'conservation', 'stewardship',
    'sustainability', 'pollution', 'deforestation', 'habitat loss',
    'indicator species', 'monitoring', 'bioaccumulation', 'biomagnification',
    'cell', 'organ', 'tissue', 'system', 'variable', 'hypothesis', 'experiment',
    'observation', 'data', 'evidence', 'conclusion', 'heat', 'temperature',
    'conduction', 'convection', 'radiation', 'insulator', 'conductor',
  ],
  MATH: [
    'equation', 'expression', 'variable', 'coefficient', 'constant',
    'ratio', 'proportion', 'percent', 'fraction', 'decimal',
    'area', 'perimeter', 'volume', 'angle', 'parallel', 'perpendicular',
    'integer', 'negative', 'positive', 'operation', 'factor', 'multiple',
    'pattern', 'sequence', 'graph', 'coordinate', 'axis', 'slope',
  ],
  ELA: [
    'theme', 'character', 'setting', 'plot', 'conflict', 'resolution',
    'inference', 'evidence', 'perspective', 'narrator', 'tone', 'mood',
    'figurative', 'metaphor', 'simile', 'imagery', 'symbolism',
    'main idea', 'supporting detail', 'summary', 'analysis', 'argument',
    'claim', 'counterclaim', 'thesis', 'conclusion', 'transition',
  ],
  SOCIAL_STUDIES: [
    'government', 'democracy', 'rights', 'responsibility', 'citizen',
    'economy', 'trade', 'culture', 'society', 'civilization',
    'geography', 'climate', 'region', 'resource', 'migration',
    'conflict', 'treaty', 'independence', 'colony', 'revolution',
    'perspective', 'bias', 'primary source', 'secondary source', 'evidence',
  ],
  GENERAL: [
    'explain', 'describe', 'compare', 'contrast', 'analyze',
    'evidence', 'example', 'support', 'reason', 'conclude',
  ],
};

export function getSubjectVocab(subject: SubjectMode): string[] {
  return SUBJECT_VOCAB[subject] || SUBJECT_VOCAB.GENERAL;
}

// ============ RELEVANCE GATE ============

/** Result of the relevance check — determines whether scoring should proceed normally. */
export interface RelevanceResult {
  relevant: boolean;
  relevanceScore: number; // 0-100
  reason: string;
  isGibberish: boolean;
  isCopiedPrompt: boolean;
}

/**
 * Check if a student response is relevant to the prompt.
 * This is the single most important quality gate — it catches:
 * - Off-topic responses
 * - Gibberish / random characters
 * - Copy-pasted prompts
 * - Filler text with no substance
 */
export function checkRelevance(
  studentResponse: string,
  prompt: string,
  rubricHint: string,
): RelevanceResult {
  const response = studentResponse.trim();
  const responseLower = response.toLowerCase();
  const promptLower = prompt.toLowerCase();
  const wordCount = response.split(/\s+/).filter(Boolean).length;

  // ── 1. Gibberish detection ──
  // Check for high ratio of non-alphabetic characters
  const alphaChars = response.replace(/[^a-zA-Z]/g, '').length;
  const totalChars = response.length;
  const alphaRatio = totalChars > 0 ? alphaChars / totalChars : 0;

  // Check for repeated character patterns (e.g. "asdfasdf", "aaaaaa")
  const repeatedPattern = /(.{2,})\1{2,}/i.test(response);
  const singleCharRepeat = /(.)(\1){4,}/i.test(response);

  // Check for very short "words" that suggest keyboard mashing
  const words = response.split(/\s+/).filter(Boolean);
  const avgWordLength = words.length > 0
    ? words.reduce((sum, w) => sum + w.length, 0) / words.length
    : 0;
  const tooManyShortWords = words.length > 3 && avgWordLength < 2.5;

  if (
    (alphaRatio < 0.5 && totalChars > 5) ||
    repeatedPattern ||
    singleCharRepeat ||
    tooManyShortWords
  ) {
    return {
      relevant: false,
      relevanceScore: 0,
      reason: 'Response appears to be random characters or gibberish.',
      isGibberish: true,
      isCopiedPrompt: false,
    };
  }

  // ── 2. Copy-paste detection ──
  // Check if the response is mostly the prompt repeated back
  if (promptLower.length > 15 && responseLower.length > 10) {
    // Normalize whitespace for comparison
    const normPrompt = promptLower.replace(/\s+/g, ' ').trim();
    const normResponse = responseLower.replace(/\s+/g, ' ').trim();

    // Check if response starts with or is mostly the prompt
    const overlapLength = Math.min(normPrompt.length, normResponse.length);
    let matchingChars = 0;
    for (let i = 0; i < overlapLength; i++) {
      if (normPrompt[i] === normResponse[i]) matchingChars++;
    }
    const overlapRatio = matchingChars / Math.max(normResponse.length, 1);

    // Also check if response contains the entire prompt
    const containsFullPrompt = normResponse.includes(normPrompt);
    const responseWithoutPrompt = containsFullPrompt
      ? normResponse.replace(normPrompt, '').trim()
      : normResponse;
    const addedContent = responseWithoutPrompt.split(/\s+/).filter(Boolean).length;

    if (overlapRatio > 0.8 || (containsFullPrompt && addedContent < 5)) {
      return {
        relevant: false,
        relevanceScore: 10,
        reason: 'Response appears to copy the prompt without adding original thought.',
        isGibberish: false,
        isCopiedPrompt: true,
      };
    }
  }

  // ── 3. Content relevance ──
  // Extract meaningful content words from the prompt (skip stop words)
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'shall', 'can', 'to', 'of', 'in', 'for',
    'on', 'with', 'at', 'by', 'from', 'as', 'into', 'about', 'between',
    'through', 'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both',
    'this', 'that', 'these', 'those', 'it', 'its', 'you', 'your', 'we',
    'our', 'they', 'their', 'what', 'which', 'who', 'how', 'why', 'when',
    'where', 'if', 'then', 'than', 'more', 'most', 'some', 'any', 'all',
    'each', 'every', 'other', 'one', 'two', 'three', 'new', 'use', 'used',
    'write', 'explain', 'describe', 'discuss', 'identify', 'list', 'name',
    'give', 'using', 'based', 'make', 'response', 'answer', 'question',
  ]);

  const extractContentWords = (text: string): string[] => {
    return text
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));
  };

  const promptContentWords = extractContentWords(prompt + ' ' + rubricHint);
  const responseContentWords = extractContentWords(response);

  if (promptContentWords.length === 0) {
    // Can't assess relevance without prompt content — give benefit of the doubt
    return {
      relevant: true,
      relevanceScore: 50,
      reason: 'Unable to assess relevance — prompt has no distinctive content words.',
      isGibberish: false,
      isCopiedPrompt: false,
    };
  }

  // Count how many prompt content words appear in the response
  const uniquePromptWords = [...new Set(promptContentWords)];
  const matchedPromptWords = uniquePromptWords.filter((w) =>
    responseContentWords.includes(w),
  );
  const promptWordCoverage = matchedPromptWords.length / uniquePromptWords.length;

  // Also check for topical overlap using 2-word phrases
  const getPhrasePairs = (wordList: string[]): string[] => {
    const pairs: string[] = [];
    for (let i = 0; i < wordList.length - 1; i++) {
      pairs.push(`${wordList[i]} ${wordList[i + 1]}`);
    }
    return pairs;
  };
  const promptPhrases = getPhrasePairs(promptContentWords);
  const responsePhrases = getPhrasePairs(responseContentWords);
  const phraseOverlap = promptPhrases.length > 0
    ? promptPhrases.filter((p) => responsePhrases.includes(p)).length / promptPhrases.length
    : 0;

  // Compute relevance score
  // Weight: 60% word coverage, 40% phrase overlap
  const rawRelevance = Math.round(promptWordCoverage * 60 + phraseOverlap * 40);
  const relevanceScore = Math.max(0, Math.min(100, rawRelevance));

  // Minimum 1 prompt word must appear for the response to be considered relevant
  const isRelevant = matchedPromptWords.length >= 1 && relevanceScore >= 15;

  return {
    relevant: isRelevant,
    relevanceScore,
    reason: isRelevant
      ? `Response addresses the prompt (matched: ${matchedPromptWords.slice(0, 5).join(', ')}).`
      : `Response does not appear to address the prompt. Expected topics: ${uniquePromptWords.slice(0, 5).join(', ')}.`,
    isGibberish: false,
    isCopiedPrompt: false,
  };
}

// ============ FALLBACK SCORING ============

/**
 * Calibrated fallback scoring using rubric criteria weights.
 * Used when no Gemini API key is available.
 *
 * v2 — Overhauled with:
 * - Relevance gate (catches off-topic / gibberish)
 * - Reduced baselines (20, not 50)
 * - Prompt-aware content matching
 * - Teacher flagging for borderline responses
 */
export function scoreFallback(opts: {
  studentResponse: string;
  prompt: string;
  rubricHint: string;
  subject: SubjectMode;
  rubricType: RubricTaskType;
  minLength: number;
}): {
  score: number;
  criteriaScores: Record<string, number>;
  feedback: string;
  strengths: string[];
  improvements: string[];
  nextStep: string;
  flagForTeacher: boolean;
  relevanceScore: number;
} {
  const { studentResponse, prompt, rubricHint, subject, rubricType, minLength } = opts;
  const response = studentResponse.trim();
  const wordCount = response.split(/\s+/).filter(Boolean).length;
  const sentenceCount = response.split(/[.!?]+/).filter(Boolean).length;
  const responseLower = response.toLowerCase();

  // ── RELEVANCE GATE — must pass before real scoring ──
  const relevance = checkRelevance(response, prompt, rubricHint);

  // If response is gibberish, return immediately with score 0
  if (relevance.isGibberish) {
    const template = getRubricTemplate(rubricType);
    const zeroCriteria: Record<string, number> = {};
    for (const c of template.criteria) zeroCriteria[c.name] = 0;
    return {
      score: 0,
      criteriaScores: zeroCriteria,
      feedback: 'This response doesn\'t appear to contain a real answer. Please re-read the question and try writing a thoughtful response.',
      strengths: [],
      improvements: ['Write a response that answers the question asked.'],
      nextStep: 'Re-read the question carefully and write at least 2-3 sentences that directly answer what is being asked.',
      flagForTeacher: true,
      relevanceScore: 0,
    };
  }

  // If response copies the prompt, return with minimal score
  if (relevance.isCopiedPrompt) {
    const template = getRubricTemplate(rubricType);
    const lowCriteria: Record<string, number> = {};
    for (const c of template.criteria) lowCriteria[c.name] = 5;
    return {
      score: 5,
      criteriaScores: lowCriteria,
      feedback: 'Your response repeats the question but doesn\'t add your own thinking. Try answering in your own words.',
      strengths: [],
      improvements: ['Use your own words to explain your thinking instead of repeating the question.'],
      nextStep: 'Put the question aside and write what you actually think or know about this topic.',
      flagForTeacher: true,
      relevanceScore: 10,
    };
  }

  // ── VOCABULARY AND CONTENT ANALYSIS ──
  const subjectTerms = getSubjectVocab(subject);
  const contextTerms = (rubricHint + ' ' + prompt).toLowerCase();
  const relevantTerms = subjectTerms.filter((t) => contextTerms.includes(t));
  const matchedTerms = relevantTerms.filter((t) => responseLower.includes(t));
  const vocabCoverage = relevantTerms.length > 0 ? matchedTerms.length / relevantTerms.length : 0.3;

  // Explanation quality
  const reasoningWords = ['because', 'therefore', 'this means', 'for example', 'such as', 'which shows', 'this is why', 'as a result', 'this causes', 'this leads to', 'in contrast', 'similarly', 'however', 'specifically'];
  const usedReasoningCount = reasoningWords.filter((w) => responseLower.includes(w)).length;
  const hasReasoning = usedReasoningCount >= 1;

  // Target word count
  const targetWords = Math.max(minLength || 40, 30);
  const lengthRatio = Math.min(wordCount / targetWords, 1.2);

  // ── RELEVANCE MULTIPLIER ──
  // If response is not relevant, cap all scores at 15
  // If borderline relevant (score 15-40), apply a penalty multiplier
  let relevanceMultiplier = 1.0;
  if (!relevance.relevant) {
    relevanceMultiplier = 0.15; // Cap effective scores at ~15
  } else if (relevance.relevanceScore < 40) {
    relevanceMultiplier = 0.4 + (relevance.relevanceScore / 40) * 0.6; // Scale 0.4 to 1.0
  }

  // ── SCORE EACH CRITERION ──
  const template = getRubricTemplate(rubricType);
  const criteriaScores: Record<string, number> = {};

  for (const c of template.criteria) {
    let cScore = 20; // baseline — was 50, now 20 ("you showed up")
    const cName = c.name.toLowerCase();

    if (cName.includes('accuracy') || cName.includes('correctness') || cName.includes('concept')) {
      // Accuracy depends heavily on relevance + vocab + reasoning
      cScore = Math.round(
        vocabCoverage * 50 +
        (hasReasoning ? 25 : 0) +
        (sentenceCount >= 2 ? 10 : 0) +
        (relevance.relevanceScore > 50 ? 15 : 0),
      );
    } else if (cName.includes('completeness') || cName.includes('development')) {
      cScore = Math.round(
        lengthRatio * 40 +
        vocabCoverage * 25 +
        (sentenceCount >= 3 ? 15 : 0) +
        (relevance.relevanceScore > 40 ? 20 : 0),
      );
    } else if (cName.includes('evidence') || cName.includes('support')) {
      cScore = Math.round(
        vocabCoverage * 35 +
        (hasReasoning ? 30 : 0) +
        (usedReasoningCount >= 2 ? 15 : 0) +
        (matchedTerms.length >= 2 ? 20 : 0),
      );
    } else if (cName.includes('clarity') || cName.includes('organization') || cName.includes('communication')) {
      cScore = Math.round(
        (sentenceCount >= 3 ? 40 : sentenceCount >= 2 ? 25 : 10) +
        (hasReasoning ? 25 : 0) +
        (lengthRatio >= 0.8 ? 15 : 0) +
        (wordCount >= 10 ? 10 : 0),
      );
    } else if (cName.includes('language') || cName.includes('convention')) {
      // Language/conventions — can only really assess length and structure without AI
      cScore = Math.round(
        30 +
        (sentenceCount >= 2 ? 25 : 0) +
        (lengthRatio >= 0.7 ? 20 : 0) +
        (wordCount >= 15 ? 15 : 0),
      );
    } else if (cName.includes('audience') || cName.includes('purpose') || cName.includes('alignment')) {
      cScore = Math.round(
        vocabCoverage * 30 +
        (relevance.relevanceScore > 40 ? 30 : relevance.relevanceScore > 20 ? 15 : 0) +
        (hasReasoning ? 20 : 0) +
        (lengthRatio >= 0.6 ? 15 : 0),
      );
    } else {
      // Generic fallback
      cScore = Math.round(
        lengthRatio * 30 +
        vocabCoverage * 30 +
        (hasReasoning ? 20 : 0) +
        (relevance.relevanceScore > 30 ? 15 : 0),
      );
    }

    // Apply relevance multiplier and clamp
    cScore = Math.round(cScore * relevanceMultiplier);
    criteriaScores[c.name] = Math.max(0, Math.min(100, cScore));
  }

  // ── WEIGHTED TOTAL ──
  const totalScore = Math.round(
    template.criteria.reduce((sum, c) => sum + (criteriaScores[c.name] * c.weight) / 100, 0),
  );

  // ── BUILD FEEDBACK ──
  const strengths: string[] = [];
  const improvements: string[] = [];

  // Only give content-specific strengths if the response is relevant
  if (relevance.relevant) {
    if (vocabCoverage >= 0.5 && matchedTerms.length > 0) {
      strengths.push(`You used key vocabulary like "${matchedTerms.slice(0, 2).join('" and "')}".`);
    }
    if (hasReasoning) {
      strengths.push('You supported your ideas with reasoning and explanation.');
    }
    if (sentenceCount >= 3 && lengthRatio >= 0.8) {
      strengths.push('Your response is well-developed with good detail.');
    } else if (sentenceCount >= 2) {
      strengths.push('You provided a multi-sentence response.');
    }
  }

  // Improvements
  if (!relevance.relevant) {
    improvements.push('Make sure your response directly answers the question that was asked.');
  }
  if (relevantTerms.length > 0 && vocabCoverage < 0.3) {
    const missing = relevantTerms.filter((t) => !responseLower.includes(t)).slice(0, 2);
    if (missing.length > 0) {
      improvements.push(`Try including key terms like "${missing.join('" or "')}" from the lesson.`);
    }
  }
  if (!hasReasoning && relevance.relevant) {
    improvements.push('Explain your thinking using words like "because", "for example", or "this means".');
  }
  if (lengthRatio < 0.6 && relevance.relevant) {
    improvements.push(`Expand your answer — aim for at least ${targetWords} words (you wrote ${wordCount}).`);
  }

  // Ensure at least one item in each list, but never fake praise
  if (strengths.length === 0) {
    if (wordCount >= 5 && relevance.relevant) {
      strengths.push('You made an effort to answer the question.');
    }
    // No strengths for irrelevant/gibberish responses — that's intentional
  }
  if (improvements.length === 0) {
    improvements.push('Add one more specific detail or example from the lesson to strengthen your answer.');
  }

  // ── SUMMARY FEEDBACK ──
  let feedback: string;
  if (!relevance.relevant) {
    feedback = `This response doesn't seem to address the question. ${improvements[0]}`;
  } else if (totalScore >= 80) {
    feedback = `Strong response — you showed clear understanding and used specific details.`;
  } else if (totalScore >= 60) {
    feedback = `Good effort! You addressed the topic. ${improvements[0] || 'Adding more specific details from the lesson would strengthen it.'}`;
  } else if (totalScore >= 40) {
    feedback = `You're starting to address the topic. ${improvements[0] || 'Try adding more specific details from the lesson.'}`;
  } else if (totalScore >= 20) {
    feedback = `Your response needs more development. ${improvements[0] || 'Review the lesson content and try to be more specific.'}`;
  } else {
    feedback = `${improvements[0] || 'Please re-read the question and write a response that directly answers what is being asked.'}`;
  }

  // ── NEXT STEP ──
  let nextStep: string;
  if (!relevance.relevant) {
    nextStep = 'Re-read the question carefully. Then write 2-3 sentences that directly answer what is being asked.';
  } else if (!hasReasoning) {
    nextStep = 'Add one sentence that starts with "because" or "for example" to explain your thinking.';
  } else if (vocabCoverage < 0.3 && relevantTerms.length > 0) {
    const missing = relevantTerms.filter((t) => !responseLower.includes(t))[0];
    nextStep = missing
      ? `Try explaining the concept of "${missing}" in your own words.`
      : 'Add one more specific detail from the lesson.';
  } else if (lengthRatio < 0.8) {
    nextStep = 'Expand your answer by adding one more specific example from the lesson.';
  } else {
    nextStep = 'Review your answer and check that every claim is supported with a specific example.';
  }

  // ── TEACHER FLAGGING ──
  // Flag for teacher review when:
  // - Borderline scores (30-55) where heuristic confidence is low
  // - Low relevance but non-zero (might be a valid tangential response)
  // - Very short responses that scored moderately (might be correct but insufficient)
  const flagForTeacher =
    (totalScore >= 30 && totalScore <= 55) ||
    (relevance.relevanceScore > 0 && relevance.relevanceScore < 40) ||
    (wordCount < 10 && totalScore > 25) ||
    !relevance.relevant;

  return {
    score: totalScore,
    criteriaScores,
    feedback,
    strengths,
    improvements,
    nextStep,
    flagForTeacher,
    relevanceScore: relevance.relevanceScore,
  };
}
