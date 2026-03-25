// ============================================
// AI Reading Tutor — Core Analysis Engine
// ============================================
// Handles transcript analysis, accuracy scoring, miscue detection,
// voice profile filtering, and Lexile estimation.

// ---------- Types ----------

export interface Miscue {
  position: number;
  expected: string;
  actual: string;
  type: 'SUBSTITUTION' | 'OMISSION' | 'INSERTION' | 'SELF_CORRECTION';
  isFiltered: boolean; // true if matched voice profile pattern
}

export interface TranscriptAnalysis {
  totalWords: number;
  correctWords: number;
  miscues: Miscue[];
  filteredMiscues: number; // miscues excluded due to voice profile
  rawAccuracy: number; // before voice profile filter (0-100)
  adjustedAccuracy: number; // after voice profile filter (0-100)
  wordsPerMinute: number;
  wordResults: WordResult[];
}

export interface WordResult {
  position: number;
  expected: string;
  actual: string | null;
  status: 'CORRECT' | 'SUBSTITUTION' | 'OMISSION' | 'INSERTION' | 'FILTERED';
}

export interface SpeechPattern {
  target: string; // the expected sound/word
  actual: string; // what student consistently produces
  examples: string[];
}

export interface VoiceProfileData {
  speechPatterns: SpeechPattern[];
  calibrationWords: { word: string; heard: string }[];
  isCalibrated: boolean;
}

// ---------- Transcript Analysis ----------

/**
 * Compare the original passage text to the speech-to-text transcript.
 * Returns word-by-word analysis with miscue detection.
 */
export function analyzeTranscript(
  originalText: string,
  transcript: string,
  voiceProfile: VoiceProfileData | null,
  durationSeconds: number
): TranscriptAnalysis {
  const expectedWords = normalizeText(originalText);
  const spokenWords = normalizeText(transcript);

  const wordResults: WordResult[] = [];
  const miscues: Miscue[] = [];

  // Use Levenshtein-based alignment for word sequences
  const alignment = alignWords(expectedWords, spokenWords);

  let correctCount = 0;
  let filteredCount = 0;

  for (let i = 0; i < alignment.length; i++) {
    const { expected, actual, type } = alignment[i];

    if (type === 'MATCH') {
      wordResults.push({
        position: i,
        expected,
        actual,
        status: 'CORRECT',
      });
      correctCount++;
    } else if (type === 'SUBSTITUTION') {
      // Check if this substitution matches a voice profile pattern
      const isFilteredByProfile = voiceProfile
        ? isVoiceProfileMatch(expected, actual ?? '', voiceProfile)
        : false;

      if (isFilteredByProfile) {
        wordResults.push({
          position: i,
          expected,
          actual,
          status: 'FILTERED',
        });
        correctCount++; // count as correct since it's a speech pattern, not a reading error
        filteredCount++;
        miscues.push({
          position: i,
          expected,
          actual: actual ?? '',
          type: 'SUBSTITUTION',
          isFiltered: true,
        });
      } else {
        wordResults.push({
          position: i,
          expected,
          actual,
          status: 'SUBSTITUTION',
        });
        miscues.push({
          position: i,
          expected,
          actual: actual ?? '',
          type: 'SUBSTITUTION',
          isFiltered: false,
        });
      }
    } else if (type === 'OMISSION') {
      wordResults.push({
        position: i,
        expected,
        actual: null,
        status: 'OMISSION',
      });
      miscues.push({
        position: i,
        expected,
        actual: '',
        type: 'OMISSION',
        isFiltered: false,
      });
    } else if (type === 'INSERTION') {
      // Student said extra words — note but don't penalize heavily
      miscues.push({
        position: i,
        expected: '',
        actual: actual ?? '',
        type: 'INSERTION',
        isFiltered: false,
      });
    }
  }

  const totalWords = expectedWords.length;
  const rawCorrect = alignment.filter((a) => a.type === 'MATCH').length;
  const rawAccuracy = totalWords > 0 ? (rawCorrect / totalWords) * 100 : 0;
  const adjustedAccuracy =
    totalWords > 0 ? (correctCount / totalWords) * 100 : 0;

  const wordsPerMinute =
    durationSeconds > 0
      ? Math.round((spokenWords.length / durationSeconds) * 60)
      : 0;

  return {
    totalWords,
    correctWords: correctCount,
    miscues: miscues.filter((m) => !m.isFiltered),
    filteredMiscues: filteredCount,
    rawAccuracy: Math.round(rawAccuracy * 10) / 10,
    adjustedAccuracy: Math.round(adjustedAccuracy * 10) / 10,
    wordsPerMinute,
    wordResults,
  };
}

// ---------- Voice Profile Matching ----------

/**
 * Check if a substitution matches a known speech pattern.
 * e.g., student always says "fink" for "think" → /θ/ → /f/ pattern
 */
function isVoiceProfileMatch(
  expected: string,
  actual: string,
  profile: VoiceProfileData
): boolean {
  if (!profile.isCalibrated || !profile.speechPatterns.length) return false;

  for (const pattern of profile.speechPatterns) {
    // Check if the expected word contains the target sound and the actual
    // word contains the substitution sound, matching the known pattern.
    // Simple heuristic: check if the calibration words show the same mapping.
    for (const example of pattern.examples) {
      const [exWord, acWord] = example.split('→').map((s) => s.trim().toLowerCase());
      if (expected === exWord && actual === acWord) {
        return true;
      }
    }

    // Also check if the substitution follows the same character pattern
    // e.g., "th" → "f" in any word
    if (
      pattern.target.length <= 3 &&
      expected.includes(pattern.target) &&
      actual === expected.replace(pattern.target, pattern.actual)
    ) {
      return true;
    }
  }

  return false;
}

// ---------- Lexile Estimation ----------

/**
 * Estimate a Lexile level based on accuracy on a passage of known difficulty.
 * Uses the principle: if accuracy is 95%+, the text is at instructional level.
 * If 90-94%, it's challenging. Below 90%, it's frustration level.
 */
export function estimateLexile(
  accuracyRate: number,
  passageLexile: number,
  comprehensionScore: number
): number {
  // Base estimation from passage level
  let estimate = passageLexile;

  // If very high accuracy + comprehension, student is above this level
  if (accuracyRate >= 98 && comprehensionScore >= 80) {
    estimate = passageLexile + 100;
  } else if (accuracyRate >= 95 && comprehensionScore >= 70) {
    estimate = passageLexile + 50;
  } else if (accuracyRate >= 90 && comprehensionScore >= 60) {
    estimate = passageLexile; // at level
  } else if (accuracyRate >= 85) {
    estimate = passageLexile - 50;
  } else {
    estimate = passageLexile - 100;
  }

  // Clamp to reasonable range
  return Math.max(100, Math.min(1200, estimate));
}

/**
 * Select the next passage based on performance history.
 * Starts easy (Grade 1-2) and adapts upward as student demonstrates mastery.
 */
export function selectNextPassageLevel(
  recentSessions: { accuracyRate: number; comprehensionScore: number; passageLexile: number }[]
): { targetLexile: number; targetGrade: number } {
  if (recentSessions.length === 0) {
    // First session: start at Grade 1 (Lexile 200) to build confidence
    return { targetLexile: 200, targetGrade: 1 };
  }

  const last = recentSessions[0];
  const avgAccuracy =
    recentSessions.reduce((sum, s) => sum + s.accuracyRate, 0) /
    recentSessions.length;
  const avgComprehension =
    recentSessions.reduce((sum, s) => sum + s.comprehensionScore, 0) /
    recentSessions.length;

  let targetLexile = last.passageLexile;

  // Move up if consistently doing well
  if (avgAccuracy >= 95 && avgComprehension >= 80 && recentSessions.length >= 2) {
    targetLexile = last.passageLexile + 75;
  } else if (avgAccuracy >= 90 && avgComprehension >= 70) {
    targetLexile = last.passageLexile + 25;
  } else if (avgAccuracy < 85 || avgComprehension < 50) {
    // Step back to rebuild confidence
    targetLexile = last.passageLexile - 50;
  }

  targetLexile = Math.max(100, Math.min(900, targetLexile));

  // Map Lexile to approximate grade
  const targetGrade =
    targetLexile <= 200
      ? 1
      : targetLexile <= 400
        ? 2
        : targetLexile <= 550
          ? 3
          : targetLexile <= 700
            ? 4
            : targetLexile <= 850
              ? 5
              : 6;

  return { targetLexile, targetGrade };
}

// ---------- Helpers ----------

/** Normalize text to lowercase words array, stripping punctuation */
function normalizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, '') // keep apostrophes for contractions
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

interface AlignedWord {
  expected: string;
  actual: string | null;
  type: 'MATCH' | 'SUBSTITUTION' | 'OMISSION' | 'INSERTION';
}

/**
 * Simple word-level alignment using greedy left-to-right matching.
 * For Phase 1 this provides adequate accuracy; Phase 2 can upgrade
 * to full edit-distance alignment.
 */
function alignWords(expected: string[], spoken: string[]): AlignedWord[] {
  const result: AlignedWord[] = [];
  let si = 0; // spoken index

  for (let ei = 0; ei < expected.length; ei++) {
    if (si >= spoken.length) {
      // Remaining expected words are omissions
      result.push({ expected: expected[ei], actual: null, type: 'OMISSION' });
      continue;
    }

    if (expected[ei] === spoken[si]) {
      result.push({ expected: expected[ei], actual: spoken[si], type: 'MATCH' });
      si++;
    } else {
      // Look ahead in spoken words for a match (handles insertions)
      const lookAhead = Math.min(si + 3, spoken.length);
      let foundAhead = -1;
      for (let k = si + 1; k < lookAhead; k++) {
        if (expected[ei] === spoken[k]) {
          foundAhead = k;
          break;
        }
      }

      if (foundAhead > -1) {
        // Words between si and foundAhead are insertions
        for (let k = si; k < foundAhead; k++) {
          result.push({
            expected: '',
            actual: spoken[k],
            type: 'INSERTION',
          });
        }
        result.push({
          expected: expected[ei],
          actual: spoken[foundAhead],
          type: 'MATCH',
        });
        si = foundAhead + 1;
      } else {
        // Look ahead in expected for a match (handles omissions)
        const eLookAhead = Math.min(ei + 3, expected.length);
        let foundEAhead = -1;
        for (let k = ei + 1; k < eLookAhead; k++) {
          if (expected[k] === spoken[si]) {
            foundEAhead = k;
            break;
          }
        }

        if (foundEAhead > -1) {
          // Words between ei and foundEAhead are omissions
          for (let k = ei; k < foundEAhead; k++) {
            result.push({
              expected: expected[k],
              actual: null,
              type: 'OMISSION',
            });
          }
          result.push({
            expected: expected[foundEAhead],
            actual: spoken[si],
            type: 'MATCH',
          });
          ei = foundEAhead; // advance expected index
          si++;
        } else {
          // Simple substitution
          result.push({
            expected: expected[ei],
            actual: spoken[si],
            type: 'SUBSTITUTION',
          });
          si++;
        }
      }
    }
  }

  // Remaining spoken words are insertions
  while (si < spoken.length) {
    result.push({
      expected: '',
      actual: spoken[si],
      type: 'INSERTION',
    });
    si++;
  }

  return result;
}
