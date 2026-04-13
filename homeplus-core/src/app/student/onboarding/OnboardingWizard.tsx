'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DrawingCanvas from '@/components/lesson/DrawingCanvas';
import { ConstructedResponseBlock } from '@/components/lesson/LessonBlockRenderer';
import styles from './onboarding.module.css';

interface Props {
  initialStep: number;
}

// Temporary hardcoded math diagnostic questions (could pull from DB later)
const MATH_QUESTIONS = [
  { id: 'q1', text: '7 × 8 = ?', options: ['54', '56', '62', '48'] },
  { id: 'q2', text: '3/4 + 1/4 = ?', options: ['2/8', '4/8', '1', '1/2'] },
  { id: 'q3', text: 'If x + 5 = 12, what is x?', options: ['5', '6', '7', '8'] },
];

export default function OnboardingWizard({ initialStep }: Props) {
  // Enforce 1-based steps so it aligns with DB nicely
  const [step, setStep] = useState(Math.max(1, initialStep));
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // Math step state
  const [mathAnswers, setMathAnswers] = useState<Record<string, string>>({});
  
  // Writing step state
  const [writingDone, setWritingDone] = useState(false);
  const [writingResponse, setWritingResponse] = useState('');

  const saveProgress = async (newStep: number, complete: boolean = false) => {
    setSaving(true);
    try {
      await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: newStep,
          status: complete ? 'COMPLETED' : 'IN_PROGRESS',
          mathData: complete ? mathAnswers : undefined,
          writingData: complete ? writingResponse : undefined,
        }),
      });
      // Force NextAuth session refresh by pinging the server layout or router
      if (complete) router.refresh();
    } catch (err) {
      console.error('Failed to save progress', err);
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    const nextStep = step + 1;
    if (nextStep > 4) {
      finishOnboarding();
    } else {
      setStep(nextStep);
      saveProgress(nextStep);
    }
  };

  const finishOnboarding = async () => {
    await saveProgress(4, true);
    // Move to dashboard
    router.replace('/student/dashboard');
  };

  const mathComplete = Object.keys(mathAnswers).length === MATH_QUESTIONS.length;

  return (
    <div className={styles.container}>
      <div className={styles.wizardCard}>
        
        {/* Progress Dots */}
        <div className={styles.stepIndicator}>
          {[1, 2, 3, 4].map((s) => (
            <div 
              key={s} 
              className={`${styles.stepDot} ${s === step ? styles.stepDotActive : ''} ${s < step ? styles.stepDotCompleted : ''}`} 
            />
          ))}
        </div>

        {/* STEP 1: Welcome */}
        {step === 1 && (
          <div className={styles.contentArea}>
            <div className={styles.header}>
              <h1>Welcome to Home Plus! 🚀</h1>
              <p>Before you dive into your courses, let's show you around.</p>
            </div>
            
            <div className={styles.aiExplainer}>
              <h2>🤖 Meet Mrs. Hammel (Your AI Assistant)</h2>
              <p>
                In Home Plus, you will be getting instant feedback on your answers from our AI, "Mrs. Hammel". 
              </p>
              <br/>
              <p>
                <strong>How it works:</strong> Mrs. Hammel grades you based on how well you answer the <i>actual question</i>. She cares about your ideas, not just your spelling! If you try to copy-paste the question back or type random gibberish, she will know, and she will ask you to try again. 
              </p>
              <br/>
              <p>
                <i>Note: Your real teachers always review your work too!</i>
              </p>
            </div>
            
            <div className={styles.footer}>
              <button disabled={saving} className={styles.btnNext} onClick={handleNext}>
                {saving ? 'Saving...' : 'Got it! Next ➔'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Canvas */}
        {step === 2 && (
          <div className={styles.contentArea}>
            <div className={styles.header}>
              <h1>Interactive Tools</h1>
              <p>Draw a smiley face to practice using the canvas tool! 🎨</p>
            </div>
            
            {/* The canvas has a lot of internal state. For onboarding, we just let them play. */}
            <div style={{ border: '2px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', height: 400 }}>
              <DrawingCanvas 
                content={{ tools: {} } as any}
                lessonId="onboarding"
                blockId="canvas-sandbox"
                onAnswer={() => {}} 
              />
            </div>
            
            <div className={styles.footer}>
              <button disabled={saving} className={styles.btnNext} onClick={handleNext}>
                {saving ? 'Saving...' : 'Looks good! Next ➔'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Math */}
        {step === 3 && (
          <div className={styles.contentArea}>
            <div className={styles.header}>
              <h1>Math Quick Check</h1>
              <p>Let's find out what you remember from last year!</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {MATH_QUESTIONS.map((q) => (
                <div key={q.id}>
                  <p style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '10px' }}>{q.text}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {q.options.map(opt => (
                      <div 
                        key={opt}
                        className={`${styles.diagnosticOption} ${mathAnswers[q.id] === opt ? styles.diagnosticOptionSelected : ''}`}
                        onClick={() => setMathAnswers({...mathAnswers, [q.id]: opt})}
                      >
                        <div style={{
                          width: '20px', height: '20px', borderRadius: '50%', 
                          border: `2px solid ${mathAnswers[q.id] === opt ? '#2563eb' : '#94a3b8'}`,
                          background: mathAnswers[q.id] === opt ? '#2563eb' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {mathAnswers[q.id] === opt && <div style={{width: 8, height: 8, background: '#fff', borderRadius: '50%'}} />}
                        </div>
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.footer}>
              <button disabled={!mathComplete || saving} className={styles.btnNext} onClick={handleNext}>
                {saving ? 'Saving...' : 'Next ➔'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Writing Baseline */}
        {step === 4 && (
          <div className={styles.contentArea}>
            <div className={styles.header}>
              <h1>Writing Baseline</h1>
              <p>Write a short paragraph introducing yourself and telling us one thing you hope to learn this year.</p>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '10px' }}>
                💡 <strong>Hint:</strong> A paragraph is usually about 5 sentences long.
              </p>
            </div>
            
            <ConstructedResponseBlock 
              content={{
                prompt: 'Introduce yourself and share one goal for this year.',
                minLength: 40,
                minExpectedWords: 40,
                teacherReviewRequired: true,
              }}
              onAnswer={(ans) => {
                setWritingResponse(ans);
                setWritingDone(true);
              }}
              // Pass standard parameters for the AI grader
              subjectMode="GENERAL"
              gradeLevel={7}
            />

            <div className={styles.footer}>
              <button disabled={!writingDone || saving} className={styles.btnNext} onClick={handleNext}>
                {saving ? 'Saving...' : 'Finish Onboarding ➔'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
