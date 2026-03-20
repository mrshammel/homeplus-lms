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

FEEDBACK PHILOSOPHY:
- Be encouraging and specific — what they did well FIRST
- Be concise — ${tone.maxFeedbackSentences} sentences max for the summary
- Give 1-2 specific strengths (reference their actual words)
- Give 1-2 actionable improvements (not vague)
- Give exactly 1 clear next step the student can act on
- ${tone.style}

SUBJECT PRIORITIES FOR ${subjectName.toUpperCase()}:
${cal.priorities.map((p) => `- ${p}`).join('\n')}

VOCABULARY EXPECTATIONS: ${cal.vocabularyExpectations}
EVIDENCE EXPECTATIONS: ${cal.evidenceExpectation}

RUBRIC CRITERIA (${rubricType}):
${criteriaText}

${rubricHint ? `TASK-SPECIFIC RUBRIC HINT:\n${rubricHint}` : ''}

SCORING BANDS:
- 90-100 Excellent: thorough, accurate, well-explained
- 75-89 Good: mostly complete, minor gaps
- 60-74 Developing: basic understanding, needs more depth
- 40-59 Beginning: partial understanding, significant gaps
- 0-39 Incomplete: major content missing or incorrect

AUTHENTIC LEARNING:
- Reward lesson-specific evidence and original thinking
- Generic or vague answers should score lower
- Student-created examples/explanations matter more than restated definitions

${teacherReviewRequired ? 'NOTE: This is a major assignment that will also be reviewed by the teacher. Help the student revise before final submission.' : ''}

Respond ONLY with valid JSON:
{
  "score": <number 0-100>,
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

/**
 * Calibrated fallback scoring using rubric criteria weights.
 * Used when no Gemini API key is available.
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
} {
  const { studentResponse, prompt, rubricHint, subject, rubricType, minLength } = opts;
  const response = studentResponse.trim();
  const wordCount = response.split(/\s+/).filter(Boolean).length;
  const sentenceCount = response.split(/[.!?]+/).filter(Boolean).length;
  const responseLower = response.toLowerCase();

  // Get vocabulary terms from subject + rubric hint + prompt
  const subjectTerms = getSubjectVocab(subject);
  const contextTerms = (rubricHint + ' ' + prompt).toLowerCase();
  const relevantTerms = subjectTerms.filter((t) => contextTerms.includes(t));
  const matchedTerms = relevantTerms.filter((t) => responseLower.includes(t));
  const vocabCoverage = relevantTerms.length > 0 ? matchedTerms.length / relevantTerms.length : 0.5;

  // Explanation quality
  const reasoningWords = ['because', 'therefore', 'this means', 'for example', 'such as', 'which shows', 'this is why', 'as a result', 'this causes', 'this leads to', 'in contrast', 'similarly', 'however', 'specifically'];
  const usedReasoningCount = reasoningWords.filter((w) => responseLower.includes(w)).length;
  const hasReasoning = usedReasoningCount >= 1;

  // Target word count
  const targetWords = Math.max(minLength || 40, 30);
  const lengthRatio = Math.min(wordCount / targetWords, 1.2);

  // Score each criterion based on rubric type
  const template = getRubricTemplate(rubricType);
  const criteriaScores: Record<string, number> = {};

  for (const c of template.criteria) {
    let cScore = 50; // baseline
    const cName = c.name.toLowerCase();

    if (cName.includes('accuracy') || cName.includes('correctness') || cName.includes('concept')) {
      cScore = Math.round(vocabCoverage * 70 + (hasReasoning ? 20 : 0) + (sentenceCount >= 2 ? 10 : 0));
    } else if (cName.includes('completeness') || cName.includes('development')) {
      cScore = Math.round(lengthRatio * 60 + vocabCoverage * 25 + (sentenceCount >= 3 ? 15 : 0));
    } else if (cName.includes('evidence') || cName.includes('support')) {
      cScore = Math.round(vocabCoverage * 50 + (hasReasoning ? 30 : 0) + (usedReasoningCount >= 2 ? 20 : 0));
    } else if (cName.includes('clarity') || cName.includes('organization') || cName.includes('communication')) {
      cScore = Math.round((sentenceCount >= 3 ? 50 : sentenceCount >= 2 ? 35 : 15) + (hasReasoning ? 30 : 0) + (lengthRatio >= 0.8 ? 20 : 0));
    } else if (cName.includes('language') || cName.includes('convention')) {
      cScore = Math.round(60 + (sentenceCount >= 2 ? 20 : 0) + (lengthRatio >= 0.7 ? 20 : 0));
    } else if (cName.includes('audience') || cName.includes('purpose') || cName.includes('alignment')) {
      cScore = Math.round(vocabCoverage * 40 + lengthRatio * 30 + (hasReasoning ? 30 : 0));
    } else {
      // Generic fallback
      cScore = Math.round(lengthRatio * 40 + vocabCoverage * 40 + (hasReasoning ? 20 : 0));
    }

    criteriaScores[c.name] = Math.max(0, Math.min(100, cScore));
  }

  // Weighted total
  const totalScore = Math.round(
    template.criteria.reduce((sum, c) => sum + (criteriaScores[c.name] * c.weight) / 100, 0),
  );

  // Build feedback
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (vocabCoverage >= 0.5) {
    strengths.push('You used important key vocabulary from the lesson.');
  } else if (relevantTerms.length > 0) {
    const missing = relevantTerms.filter((t) => !responseLower.includes(t)).slice(0, 3);
    improvements.push(`Include more key terms like: ${missing.join(', ')}.`);
  }

  if (hasReasoning) {
    strengths.push('You explained your thinking with reasoning words.');
  } else {
    improvements.push('Add reasoning words like "because", "for example", or "this means" to explain your thinking.');
  }

  if (lengthRatio >= 1) {
    strengths.push('Your response has good detail and length.');
  } else if (lengthRatio < 0.6) {
    improvements.push(`Write more — aim for at least ${targetWords} words (you wrote ${wordCount}).`);
  }

  if (sentenceCount >= 3) {
    strengths.push('Your answer is well-structured with multiple sentences.');
  }

  if (strengths.length === 0) strengths.push('You attempted the response.');
  if (improvements.length === 0) improvements.push('Keep building on this strong work!');

  // Summary feedback
  const band = getScoringBand(totalScore);
  let feedback: string;
  if (totalScore >= 80) {
    feedback = `Strong response! You showed good understanding. ${band.descriptor}.`;
  } else if (totalScore >= 60) {
    feedback = `Good start! You covered important ideas. ${improvements[0] || 'Adding more detail would help.'}`;
  } else if (totalScore >= 40) {
    feedback = `You're on the right track. ${improvements[0] || 'Try adding more specific details from the lesson.'}`;
  } else {
    feedback = `Good effort starting this. ${improvements[0] || 'Review the lesson content and try to be more specific.'}`;
  }

  // Next step
  let nextStep: string;
  if (!hasReasoning) {
    nextStep = 'Add one sentence that starts with "because" or "for example" to explain your thinking.';
  } else if (vocabCoverage < 0.5 && relevantTerms.length > 0) {
    const missing = relevantTerms.filter((t) => !responseLower.includes(t))[0];
    nextStep = missing ? `Try using the term "${missing}" in your explanation.` : 'Add one more specific detail from the lesson.';
  } else if (lengthRatio < 0.8) {
    nextStep = 'Expand your answer by adding one more specific example from the lesson.';
  } else {
    nextStep = 'Review your answer and check that every claim is supported with a specific example.';
  }

  return { score: totalScore, criteriaScores, feedback, strengths, improvements, nextStep };
}
