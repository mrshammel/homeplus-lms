// ============================================
// Mastery Engines - Home Plus LMS
// ============================================
// Subject-specific mastery evaluation logic.
// Each engine determines how a student's quiz answers
// are scored and whether mastery/reteach is triggered.

import type { MasteryEngine, MasteryResult, MasteryConfig } from './lesson-types';

// ---------- Helpers ----------

function scoreAnswers(
  answers: Array<{ questionId: string; response: string }>,
  questions: Array<{
    id: string;
    correctAnswer: string | null;
    outcomeCode: string | null;
    options: any;
    questionType: string;
  }>,
): { correct: number; total: number; missedOutcomes: string[]; results: Array<{ questionId: string; correct: boolean; outcomeCode: string | null }> } {
  let correct = 0;
  const missedOutcomes: string[] = [];
  const results: Array<{ questionId: string; correct: boolean; outcomeCode: string | null }> = [];

  for (const answer of answers) {
    const q = questions.find((qq) => qq.id === answer.questionId);
    if (!q) continue;

    let isCorrect = false;

    if (q.questionType === 'MULTIPLE_CHOICE' && q.options) {
      // For MC, check if selected option is the correct one
      const opts = q.options as Array<{ value: string; correct?: boolean }>;
      const selected = opts.find((o) => o.value === answer.response);
      isCorrect = !!selected?.correct;
    } else {
      // For other types, compare normalized strings
      isCorrect =
        q.correctAnswer !== null &&
        answer.response.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
    }

    if (isCorrect) {
      correct++;
    } else if (q.outcomeCode && !missedOutcomes.includes(q.outcomeCode)) {
      missedOutcomes.push(q.outcomeCode);
    }

    results.push({ questionId: q.id, correct: isCorrect, outcomeCode: q.outcomeCode });
  }

  return { correct, total: answers.length, missedOutcomes, results };
}

// ============ SCIENCE MASTERY ENGINE ============
// Strict 80% gate, outcome-tagged reteach, 2-miss-same-outcome -> reteach

export const ScienceMasteryEngine: MasteryEngine = {
  subjectMode: 'SCIENCE',
  evaluate(answers, questions, previousAttempts, config) {
    const { correct, total, missedOutcomes, results } = scoreAnswers(answers, questions);
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const passed = score >= config.passPercent;

    // Check for 2 consecutive misses on the same outcome
    let needsReteach = false;
    let reteachOutcome: string | undefined;

    if (!passed) {
      // Build per-outcome miss streak from previous + current attempts
      const outcomeMissStreaks: Record<string, number> = {};

      // Previous attempts: count consecutive misses at tail
      const sortedPrev = [...previousAttempts].sort(
        (a, b) => a.attemptNumber - b.attemptNumber,
      );
      for (const prev of sortedPrev) {
        const q = questions.find((qq) => qq.id === prev.questionId);
        if (!q?.outcomeCode) continue;
        if (!prev.correct) {
          outcomeMissStreaks[q.outcomeCode] = (outcomeMissStreaks[q.outcomeCode] || 0) + 1;
        } else {
          outcomeMissStreaks[q.outcomeCode] = 0;
        }
      }

      // Current attempt misses
      for (const r of results) {
        if (!r.outcomeCode) continue;
        if (!r.correct) {
          outcomeMissStreaks[r.outcomeCode] = (outcomeMissStreaks[r.outcomeCode] || 0) + 1;
          if (outcomeMissStreaks[r.outcomeCode] >= 2) {
            needsReteach = true;
            reteachOutcome = r.outcomeCode;
            break;
          }
        } else {
          outcomeMissStreaks[r.outcomeCode] = 0;
        }
      }
    }

    const attemptCount = Math.max(...previousAttempts.map((a) => a.attemptNumber), 0) + 1;
    const canRetry = !passed && !needsReteach && attemptCount < config.maxRetries;

    let feedback: string;
    if (passed) {
      feedback = ` Mastered! You scored ${score}%. Great work!`;
    } else if (needsReteach) {
      feedback = `You need more practice on a specific concept. Let's review it together.`;
    } else if (canRetry) {
      feedback = `You scored ${score}%. You need ${config.passPercent}% to pass. Try again - the questions will focus on what you missed.`;
    } else {
      feedback = `You scored ${score}%. Speak with your teacher for next steps.`;
    }

    return {
      passed,
      score,
      totalQuestions: total,
      correctCount: correct,
      missedOutcomes,
      needsReteach,
      reteachOutcome,
      feedback,
      canRetry,
    };
  },
};

// ============ ELA MASTERY ENGINE ============
// Completion + response quality, not quiz-gated.
// Supports teacher review and revision workflows.

export const ELAMasteryEngine: MasteryEngine = {
  subjectMode: 'ELA',
  evaluate(answers, questions, _previousAttempts, _config) {
    const { correct, total, missedOutcomes } = scoreAnswers(answers, questions);
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;

    // ELA uses completion-based progression
    // Auto-scoreable items (vocab, comprehension MC) contribute to score
    // Constructed responses are tracked as "submitted" - teacher reviews later
    const hasResponses = answers.length > 0;
    const passed = hasResponses && (total === 0 || score >= 60);

    let feedback: string;
    if (passed) {
      feedback = `✓ Nice work! Your responses have been submitted.${
        total > 0 ? ` You scored ${score}% on auto-scored items.` : ''
      } Your teacher may review your written work.`;
    } else {
      feedback = `Please complete all required responses before continuing.`;
    }

    return {
      passed,
      score,
      totalQuestions: total,
      correctCount: correct,
      missedOutcomes,
      needsReteach: false,
      feedback,
      canRetry: !passed,
    };
  },
};

// ============ MATH MASTERY ENGINE ============
// Procedural accuracy emphasis, immediate corrective feedback, skill-specific retry.

export const MathMasteryEngine: MasteryEngine = {
  subjectMode: 'MATH',
  evaluate(answers, questions, previousAttempts, config) {
    const { correct, total, missedOutcomes, results } = scoreAnswers(answers, questions);
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const passed = score >= config.passPercent;

    const attemptCount = Math.max(...previousAttempts.map((a) => a.attemptNumber), 0) + 1;
    const canRetry = !passed && attemptCount < config.maxRetries;

    let feedback: string;
    if (passed) {
      feedback = ` Great job! You scored ${score}%. Mastery achieved!`;
    } else if (canRetry) {
      // Math gives targeted feedback
      const skillsToReview = missedOutcomes.length > 0
        ? ` Focus on: ${missedOutcomes.join(', ')}.`
        : '';
      feedback = `You scored ${score}%. You need ${config.passPercent}% to pass.${skillsToReview} Try again!`;
    } else {
      feedback = `You scored ${score}%. Review the worked examples and speak with your teacher.`;
    }

    return {
      passed,
      score,
      totalQuestions: total,
      correctCount: correct,
      missedOutcomes,
      needsReteach: false,
      feedback,
      canRetry,
    };
  },
};

// ============ SOCIAL STUDIES MASTERY ENGINE ============
// Source interpretation + evidence-based response, reflection-centered.

export const SocialStudiesMasteryEngine: MasteryEngine = {
  subjectMode: 'SOCIAL_STUDIES',
  evaluate(answers, questions, _previousAttempts, _config) {
    const { correct, total, missedOutcomes } = scoreAnswers(answers, questions);
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;

    // Social Studies uses a blend: auto-scored items + response completion
    const hasResponses = answers.length > 0;
    const passed = hasResponses && (total === 0 || score >= 60);

    let feedback: string;
    if (passed) {
      feedback = `✓ Well done! Your analysis and responses have been recorded.${
        total > 0 ? ` Comprehension score: ${score}%.` : ''
      }`;
    } else {
      feedback = `Please complete all required responses and comprehension checks.`;
    }

    return {
      passed,
      score,
      totalQuestions: total,
      correctCount: correct,
      missedOutcomes,
      needsReteach: false,
      feedback,
      canRetry: !passed,
    };
  },
};

// ============ PHONICS MASTERY ENGINE ============
// Specific thresholds for decoding and encoding.
// Excludes Steps 1-3 (Warm-ups) from calculation.

export const PhonicsMasteryEngine: MasteryEngine = {
  subjectMode: 'PHONICS',
  evaluate(answers, questions, _previousAttempts, _config) {
    // We expect the outcomeCode or questionType to indicate the type of step
    // e.g., "DECODING_STEP4", "ENCODING_STEP8", "WARMUP_STEP1"
    
    let decodingTotal = 0;
    let decodingCorrect = 0;
    
    let encodingTotal = 0;
    let encodingCorrect = 0;

    const { results } = scoreAnswers(answers, questions);

    for (const r of results) {
      const q = questions.find(qq => qq.id === r.questionId);
      if (!q) continue;

      const code = (q.outcomeCode || '').toUpperCase();
      
      // Exclude Steps 1-3
      if (code.includes('STEP1') || code.includes('STEP2') || code.includes('STEP3') || code.includes('WARMUP')) {
        continue;
      }

      if (code.includes('DECODING') || code.includes('STEP4') || code.includes('STEP7') || (code.includes('STEP5') && code.includes('DEC'))) {
        decodingTotal++;
        if (r.correct) decodingCorrect++;
      } else if (code.includes('ENCODING') || code.includes('STEP8') || (code.includes('STEP5') && code.includes('ENC'))) {
        encodingTotal++;
        if (r.correct) encodingCorrect++;
      }
    }

    const decodingAccuracy = decodingTotal > 0 ? (decodingCorrect / decodingTotal) : 1.0;
    const encodingAccuracy = encodingTotal > 0 ? (encodingCorrect / encodingTotal) : 1.0;

    // Both thresholds must be met in the same session
    const passed = (decodingAccuracy >= 0.90) && (encodingAccuracy >= 0.85);

    let feedback: string;
    if (passed) {
      feedback = `✓ Mastered! Decoding: ${Math.round(decodingAccuracy * 100)}%, Encoding: ${Math.round(encodingAccuracy * 100)}%`;
    } else {
      feedback = `Keep practicing. You need 90% decoding and 85% encoding to pass. (Your score: Decoding ${Math.round(decodingAccuracy * 100)}%, Encoding ${Math.round(encodingAccuracy * 100)}%)`;
    }

    // The overall score could be a weighted average, but the thresholds dictate passing
    const overallScore = Math.round(((decodingAccuracy + encodingAccuracy) / 2) * 100);

    const attemptCount = Math.max(..._previousAttempts.map((a) => a.attemptNumber), 0) + 1;
    // 3-Strike Rule: 3 consecutive failures halts progression and flags teacher (needsReteach)
    const needsReteach = !passed && attemptCount >= 3;
    const canRetry = !passed && !needsReteach;

    return {
      passed,
      score: overallScore,
      totalQuestions: decodingTotal + encodingTotal,
      correctCount: decodingCorrect + encodingCorrect,
      missedOutcomes: [],
      needsReteach,
      feedback,
      canRetry,
    };
  },
};

// ---------- Engine Registry ----------

export function getMasteryEngine(subjectMode: string): MasteryEngine {
  switch (subjectMode) {
    case 'SCIENCE':
      return ScienceMasteryEngine;
    case 'ELA':
      return ELAMasteryEngine;
    case 'MATH':
      return MathMasteryEngine;
    case 'SOCIAL_STUDIES':
      return SocialStudiesMasteryEngine;
    case 'PHONICS':
      return PhonicsMasteryEngine;
    default:
      return ELAMasteryEngine; // GENERAL uses ELA's soft model
  }
}
