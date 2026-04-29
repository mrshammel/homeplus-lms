'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './phonics-lesson.module.css';

interface GraphemeCard {
  grapheme: string;
  phoneme: string;
  articulatoryGestureScript: string | null;
  secretStoryScript: string | null;
}

interface Word {
  word: string;
  isHeartWord: boolean;
}

interface LessonData {
  id: string;
  title: string;
  targetSkill: string | null;
  keyword: string | null;
  description: string | null;
  decodablePassage: string | null;
  newGrapheme: GraphemeCard | null;
  reviewGraphemes: GraphemeCard[];
  decodableWords: Word[];
  heartWords: Word[];
  previousMastery: { lessonId: string; status: string } | null;
}

type StepId =
  | 'warm_up'
  | 'review_graphemes'
  | 'new_grapheme'
  | 'word_reading'
  | 'heart_words'
  | 'encoding'
  | 'decodable_text'
  | 'comprehension'
  | 'mastery_check'
  | 'complete';

const STEPS: { id: StepId; label: string; emoji: string }[] = [
  { id: 'warm_up', label: 'Warm-Up', emoji: '🗣️' },
  { id: 'review_graphemes', label: 'Review', emoji: '👁️' },
  { id: 'new_grapheme', label: 'New Sound', emoji: '✨' },
  { id: 'word_reading', label: 'Word Reading', emoji: '📖' },
  { id: 'heart_words', label: 'Heart Words', emoji: '❤️' },
  { id: 'encoding', label: 'Spelling', emoji: '✏️' },
  { id: 'decodable_text', label: 'Read', emoji: '📚' },
  { id: 'comprehension', label: 'Comprehension', emoji: '💭' },
  { id: 'mastery_check', label: 'Check', emoji: '✅' },
];

interface Props {
  lesson: LessonData;
}

export function PhonicsLessonClient({ lesson }: Props) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<StepId>('warm_up');
  const [stepIndex, setStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<StepId>>(new Set());

  // Encoding state
  const [spellingAnswers, setSpellingAnswers] = useState<Record<string, string>>({});
  const [spellingChecked, setSpellingChecked] = useState(false);

  // Decoding state
  const [decodingAnswers, setDecodingAnswers] = useState<Record<string, string>>({});

  // Mastery submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [masteryResult, setMasteryResult] = useState<any>(null);

  const goNext = () => {
    const completed = new Set(completedSteps);
    completed.add(currentStep);
    setCompletedSteps(completed);

    if (stepIndex < STEPS.length - 1) {
      const nextStep = STEPS[stepIndex + 1];
      setCurrentStep(nextStep.id);
      setStepIndex(stepIndex + 1);
    } else {
      setCurrentStep('complete');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitMastery = async () => {
    setIsSubmitting(true);
    try {
      // Calculate decoding score (word reading)
      const decodingTotal = lesson.decodableWords.length;
      const decodingCorrect = Object.values(decodingAnswers).filter(v => v === 'correct').length;

      // Calculate encoding score (spelling)
      const encodingTotal = lesson.decodableWords.slice(0, 5).length;
      const encodingCorrect = lesson.decodableWords.slice(0, 5).filter(w => {
        const ans = spellingAnswers[w.word] || '';
        return ans.trim().toLowerCase() === w.word.toLowerCase();
      }).length;

      const res = await fetch(`/api/phonics/submit/${lesson.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decodingCorrect,
          decodingTotal,
          encodingCorrect,
          encodingTotal,
        }),
      });

      const result = await res.json();
      setMasteryResult(result);
      goNext();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.lessonMeta}>
            <span className={styles.lessonTag}>🔤 Phonics</span>
            <h1 className={styles.lessonTitle}>{lesson.title}</h1>
            {lesson.targetSkill && <p className={styles.lessonSubtitle}>{lesson.targetSkill}</p>}
          </div>
          <div className={styles.progressBar}>
            {STEPS.map((step, i) => (
              <div
                key={step.id}
                className={`${styles.progressStep} ${completedSteps.has(step.id) ? styles.done : ''} ${currentStep === step.id ? styles.active : ''}`}
                title={step.label}
              >
                <span>{completedSteps.has(step.id) ? '✓' : step.emoji}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Step Content */}
      <main className={styles.main}>
        {currentStep === 'warm_up' && (
          <StepWarmUp keyword={lesson.keyword} onNext={goNext} />
        )}
        {currentStep === 'review_graphemes' && (
          <StepReviewGraphemes graphemes={lesson.reviewGraphemes} onNext={goNext} />
        )}
        {currentStep === 'new_grapheme' && (
          <StepNewGrapheme grapheme={lesson.newGrapheme} onNext={goNext} />
        )}
        {currentStep === 'word_reading' && (
          <StepWordReading
            words={lesson.decodableWords}
            answers={decodingAnswers}
            setAnswers={setDecodingAnswers}
            onNext={goNext}
          />
        )}
        {currentStep === 'heart_words' && (
          <StepHeartWords words={lesson.heartWords} onNext={goNext} />
        )}
        {currentStep === 'encoding' && (
          <StepEncoding
            words={lesson.decodableWords.slice(0, 5)}
            answers={spellingAnswers}
            setAnswers={setSpellingAnswers}
            checked={spellingChecked}
            setChecked={setSpellingChecked}
            onNext={goNext}
          />
        )}
        {currentStep === 'decodable_text' && (
          <StepDecodableText passage={lesson.decodablePassage} onNext={goNext} />
        )}
        {currentStep === 'comprehension' && (
          <StepComprehension passage={lesson.decodablePassage} onNext={goNext} />
        )}
        {currentStep === 'mastery_check' && (
          <StepMasteryCheck
            onSubmit={handleSubmitMastery}
            isSubmitting={isSubmitting}
          />
        )}
        {currentStep === 'complete' && (
          <StepComplete result={masteryResult} lessonTitle={lesson.title} router={router} />
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────
// Step Components
// ─────────────────────────────────────────────

function StepWarmUp({ keyword, onNext }: { keyword: string | null; onNext: () => void }) {
  const [done, setDone] = useState(false);
  return (
    <div className={styles.stepCard}>
      <div className={styles.stepHeader}>
        <span className={styles.stepEmoji}>🗣️</span>
        <div>
          <h2>Step 1: Phoneme Awareness Warm-Up</h2>
          <p className={styles.stepSubtitle}>Listen and respond to phoneme practice</p>
        </div>
      </div>
      <div className={styles.warmUpContent}>
        <div className={styles.instructionBox}>
          <p>🎯 <strong>Today's focus word:</strong></p>
          <div className={styles.keywordDisplay}>{keyword || '—'}</div>
          <p>Say the sounds in this word slowly. Tap your fingers as you go.</p>
        </div>
        <div className={styles.practiceItems}>
          {['Say the word.', 'Segment the sounds (tap each sound).', 'Blend the sounds back together.', 'Say it fast!'].map((task, i) => (
            <div key={i} className={`${styles.practiceItem} ${done ? styles.practiceItemDone : ''}`}>
              <span className={styles.practiceNum}>{i + 1}</span>
              <span>{task}</span>
            </div>
          ))}
        </div>
        <button className={styles.readyBtn} onClick={() => { setDone(true); setTimeout(onNext, 400); }}>
          I'm Ready! →
        </button>
      </div>
    </div>
  );
}

function StepReviewGraphemes({ graphemes, onNext }: { graphemes: GraphemeCard[]; onNext: () => void }) {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [allSeen, setAllSeen] = useState(graphemes.length === 0);

  const flip = (i: number) => {
    const next = new Set(flipped);
    next.add(i);
    setFlipped(next);
    if (next.size === graphemes.length) setAllSeen(true);
  };

  if (graphemes.length === 0) {
    return (
      <div className={styles.stepCard}>
        <div className={styles.stepHeader}><span className={styles.stepEmoji}>👁️</span><h2>Step 2: Review</h2></div>
        <p className={styles.emptyState}>No previous graphemes to review yet — this is your first lesson!</p>
        <button className={styles.nextBtn} onClick={onNext}>Next →</button>
      </div>
    );
  }

  return (
    <div className={styles.stepCard}>
      <div className={styles.stepHeader}>
        <span className={styles.stepEmoji}>👁️</span>
        <div><h2>Step 2: Review Previous Sounds</h2><p className={styles.stepSubtitle}>Tap each card to reveal its sound</p></div>
      </div>
      <div className={styles.graphemeGrid}>
        {graphemes.map((g, i) => (
          <div key={i} className={`${styles.graphemeCard} ${flipped.has(i) ? styles.graphemeCardFlipped : ''}`} onClick={() => flip(i)}>
            <div className={styles.graphemeFront}>{g.grapheme}</div>
            <div className={styles.graphemeBack}>
              <span className={styles.phonemeLabel}>{g.phoneme}</span>
              {g.secretStoryScript && <p className={styles.secretStory}>{g.secretStoryScript}</p>}
            </div>
          </div>
        ))}
      </div>
      {allSeen && <button className={styles.nextBtn} onClick={onNext}>Next →</button>}
    </div>
  );
}

function StepNewGrapheme({ grapheme, onNext }: { grapheme: GraphemeCard | null; onNext: () => void }) {
  const [revealed, setRevealed] = useState(false);
  if (!grapheme) return (
    <div className={styles.stepCard}>
      <button className={styles.nextBtn} onClick={onNext}>Next →</button>
    </div>
  );
  return (
    <div className={styles.stepCard}>
      <div className={styles.stepHeader}>
        <span className={styles.stepEmoji}>✨</span>
        <div><h2>Step 3: New Sound — {grapheme.grapheme}</h2><p className={styles.stepSubtitle}>Learn today's grapheme</p></div>
      </div>
      <div className={styles.newGraphemeContent}>
        <div className={styles.bigGrapheme} onClick={() => setRevealed(true)}>
          <span>{grapheme.grapheme}</span>
          {revealed && <div className={styles.phonemeReveal}>{grapheme.phoneme}</div>}
        </div>
        {revealed && (
          <div className={styles.articulationBox}>
            <h3>How to Make This Sound:</h3>
            <p>{grapheme.articulatoryGestureScript}</p>
            {grapheme.secretStoryScript && (
              <div className={styles.secretStoryBox}>
                <span>⭐ Secret Story:</span>
                <p>{grapheme.secretStoryScript}</p>
              </div>
            )}
          </div>
        )}
        {!revealed && <p className={styles.tapHint}>Tap the letter to hear its sound →</p>}
        {revealed && <button className={styles.nextBtn} onClick={onNext}>I've Got It! →</button>}
      </div>
    </div>
  );
}

function StepWordReading({ words, answers, setAnswers, onNext }: {
  words: Word[];
  answers: Record<string, string>;
  setAnswers: (a: Record<string, string>) => void;
  onNext: () => void;
}) {
  const decodable = words.filter(w => !w.isHeartWord);
  const allAnswered = decodable.length === 0 || decodable.every(w => answers[w.word]);

  return (
    <div className={styles.stepCard}>
      <div className={styles.stepHeader}>
        <span className={styles.stepEmoji}>📖</span>
        <div><h2>Step 4: Word Reading</h2><p className={styles.stepSubtitle}>Can you read each word?</p></div>
      </div>
      <div className={styles.wordReadingGrid}>
        {decodable.map((w, i) => (
          <div key={i} className={styles.wordReadCard}>
            <div className={styles.wordDisplay}>{w.word}</div>
            <div className={styles.wordCheck}>
              <button
                className={`${styles.checkBtn} ${answers[w.word] === 'correct' ? styles.correct : ''}`}
                onClick={() => setAnswers({ ...answers, [w.word]: 'correct' })}
              >✓ Got it</button>
              <button
                className={`${styles.checkBtn} ${answers[w.word] === 'retry' ? styles.retry : ''}`}
                onClick={() => setAnswers({ ...answers, [w.word]: 'retry' })}
              >↺ Try again</button>
            </div>
          </div>
        ))}
      </div>
      {allAnswered && <button className={styles.nextBtn} onClick={onNext}>Next →</button>}
    </div>
  );
}

function StepHeartWords({ words, onNext }: { words: Word[]; onNext: () => void }) {
  const [practiced, setPracticed] = useState<Set<number>>(new Set());
  const heartWords = words.filter(w => w.isHeartWord);
  const allDone = heartWords.length === 0 || practiced.size === heartWords.length;

  if (heartWords.length === 0) {
    return (
      <div className={styles.stepCard}>
        <div className={styles.stepHeader}><span className={styles.stepEmoji}>❤️</span><h2>Step 5: Heart Words</h2></div>
        <p className={styles.emptyState}>No new Heart Words in this lesson.</p>
        <button className={styles.nextBtn} onClick={onNext}>Next →</button>
      </div>
    );
  }

  return (
    <div className={styles.stepCard}>
      <div className={styles.stepHeader}>
        <span className={styles.stepEmoji}>❤️</span>
        <div><h2>Step 5: Heart Words</h2><p className={styles.stepSubtitle}>These words we know by heart — they don't follow the rules!</p></div>
      </div>
      <div className={styles.heartWordGrid}>
        {heartWords.map((w, i) => (
          <div key={i} className={`${styles.heartWordCard} ${practiced.has(i) ? styles.heartWordPracticed : ''}`}
            onClick={() => { const next = new Set(practiced); next.add(i); setPracticed(next); }}>
            <span className={styles.heartIcon}>❤️</span>
            <span className={styles.heartWordText}>{w.word}</span>
            <span className={styles.heartWordTap}>{practiced.has(i) ? '✓' : 'Tap to practice'}</span>
          </div>
        ))}
      </div>
      <p className={styles.heartWordHint}>Say it, spell it, say it: <em>"{heartWords[0]?.word}"</em></p>
      {allDone && <button className={styles.nextBtn} onClick={onNext}>Next →</button>}
    </div>
  );
}

function StepEncoding({ words, answers, setAnswers, checked, setChecked, onNext }: {
  words: Word[];
  answers: Record<string, string>;
  setAnswers: (a: Record<string, string>) => void;
  checked: boolean;
  setChecked: (v: boolean) => void;
  onNext: () => void;
}) {
  const allFilled = words.every(w => answers[w.word]?.trim());
  const results = words.map(w => ({
    word: w.word,
    answer: answers[w.word] || '',
    correct: (answers[w.word] || '').trim().toLowerCase() === w.word.toLowerCase(),
  }));
  const correctCount = results.filter(r => r.correct).length;

  return (
    <div className={styles.stepCard}>
      <div className={styles.stepHeader}>
        <span className={styles.stepEmoji}>✏️</span>
        <div><h2>Step 6: Spelling (Encoding)</h2><p className={styles.stepSubtitle}>Spell each word from the sounds you hear</p></div>
      </div>
      <p className={styles.encodingInstructor}>💡 Listen to each word and type it using the sounds you've learned.</p>
      <div className={styles.encodingList}>
        {words.map((w, i) => (
          <div key={i} className={styles.encodingItem}>
            <span className={styles.encodingNum}>{i + 1}.</span>
            <div className={styles.encodingWordHint}>
              <span className={styles.phonemeDots}>{w.word.split('').map(() => '·').join(' ')}</span>
              <span className={styles.phonemeCount}>{w.word.length} sounds</span>
            </div>
            <input
              className={`${styles.encodingInput} ${checked ? (results[i].correct ? styles.inputCorrect : styles.inputWrong) : ''}`}
              type="text"
              value={answers[w.word] || ''}
              onChange={e => setAnswers({ ...answers, [w.word]: e.target.value })}
              placeholder="Spell it..."
              disabled={checked}
            />
            {checked && (
              <span className={styles.encodingResult}>
                {results[i].correct ? '✓' : `✗ "${w.word}"`}
              </span>
            )}
          </div>
        ))}
      </div>
      {!checked && allFilled && (
        <button className={styles.checkSpellingBtn} onClick={() => setChecked(true)}>
          Check My Spelling ✓
        </button>
      )}
      {checked && (
        <div className={styles.encodingScore}>
          <p>{correctCount}/{words.length} correct!</p>
          <button className={styles.nextBtn} onClick={onNext}>Next →</button>
        </div>
      )}
    </div>
  );
}

function StepDecodableText({ passage, onNext }: { passage: string | null; onNext: () => void }) {
  const [read, setRead] = useState(false);
  return (
    <div className={styles.stepCard}>
      <div className={styles.stepHeader}>
        <span className={styles.stepEmoji}>📚</span>
        <div><h2>Step 7: Read the Passage</h2><p className={styles.stepSubtitle}>Use your decoding skills to read aloud</p></div>
      </div>
      <div className={styles.passageBox}>
        {passage || 'No passage available for this lesson yet.'}
      </div>
      <div className={styles.passageInstructions}>
        <p>📌 Read the passage aloud — slowly and carefully.</p>
        <p>📌 If you get stuck, sound it out letter by letter.</p>
        <p>📌 Read it a second time, faster.</p>
      </div>
      <button className={styles.readyBtn} onClick={() => { setRead(true); setTimeout(onNext, 300); }}>
        I Read It! →
      </button>
    </div>
  );
}

function StepComprehension({ passage, onNext }: { passage: string | null; onNext: () => void }) {
  const [answer, setAnswer] = useState('');

  return (
    <div className={styles.stepCard}>
      <div className={styles.stepHeader}>
        <span className={styles.stepEmoji}>💭</span>
        <div><h2>Step 8: Think About It</h2><p className={styles.stepSubtitle}>Answer in a full sentence</p></div>
      </div>
      <div className={styles.passageBoxSmall}>{passage}</div>
      <div className={styles.comprehensionQuestion}>
        <label>Who or what is this passage about? Write one sentence.</label>
        <textarea
          className={styles.comprehensionInput}
          rows={3}
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="This passage is about..."
        />
      </div>
      <button className={styles.nextBtn} onClick={onNext} disabled={answer.trim().length < 5}>
        Submit →
      </button>
    </div>
  );
}

function StepMasteryCheck({ onSubmit, isSubmitting }: { onSubmit: () => void; isSubmitting: boolean }) {
  return (
    <div className={styles.stepCard}>
      <div className={styles.stepHeader}>
        <span className={styles.stepEmoji}>✅</span>
        <div><h2>Step 9: Mastery Check</h2><p className={styles.stepSubtitle}>Your scores will be calculated</p></div>
      </div>
      <div className={styles.masteryCheckContent}>
        <div className={styles.masteryCheckInfo}>
          <div className={styles.masteryRule}>
            <span>🎯</span>
            <span>Decoding accuracy: <strong>90%</strong> to pass</span>
          </div>
          <div className={styles.masteryRule}>
            <span>✏️</span>
            <span>Encoding accuracy: <strong>85%</strong> to pass</span>
          </div>
          <div className={styles.masteryRule}>
            <span>❤️</span>
            <span>Warmup steps (1-3) don't count toward your grade</span>
          </div>
        </div>
        <button className={styles.submitBtn} onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Calculating...' : 'Submit & Check Mastery'}
        </button>
      </div>
    </div>
  );
}

function StepComplete({ result, lessonTitle, router }: { result: any; lessonTitle: string; router: any }) {
  const passed = result?.passed;
  const needsReteach = result?.needsReteach;

  return (
    <div className={styles.stepCard}>
      <div className={styles.completeContent}>
        {passed ? (
          <>
            <div className={styles.completeEmoji}>🏆</div>
            <h2 className={styles.completeTitle}>Lesson Mastered!</h2>
            <p className={styles.completeSubtitle}>You've mastered <strong>{lessonTitle}</strong>!</p>
            {result && (
              <div className={styles.scoreGrid}>
                <div className={styles.scoreBox}>
                  <span className={styles.scoreLabel}>Decoding</span>
                  <span className={styles.scoreValue}>{Math.round((result.decodingAccuracy || 0) * 100)}%</span>
                </div>
                <div className={styles.scoreBox}>
                  <span className={styles.scoreLabel}>Encoding</span>
                  <span className={styles.scoreValue}>{Math.round((result.encodingAccuracy || 0) * 100)}%</span>
                </div>
              </div>
            )}
          </>
        ) : needsReteach ? (
          <>
            <div className={styles.completeEmoji}>🤔</div>
            <h2 className={styles.completeTitle}>Let's Practice More</h2>
            <p className={styles.completeSubtitle}>Your teacher has been notified. Keep working on <strong>{lessonTitle}</strong>.</p>
          </>
        ) : (
          <>
            <div className={styles.completeEmoji}>💪</div>
            <h2 className={styles.completeTitle}>Good Try!</h2>
            <p className={styles.completeSubtitle}>You're making progress on <strong>{lessonTitle}</strong>. Try again!</p>
            {result?.feedback && <p className={styles.feedbackText}>{result.feedback}</p>}
          </>
        )}
        <div className={styles.completeActions}>
          {!passed && !needsReteach && (
            <button className={styles.retryBtn} onClick={() => window.location.reload()}>
              Try Again
            </button>
          )}
          <button className={styles.dashboardBtn} onClick={() => router.push('/student/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
