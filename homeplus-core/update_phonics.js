const fs = require('fs');

let content = fs.readFileSync('src/components/lesson/LessonBlockRenderer.tsx', 'utf-8');

// Replace the return <PhonicsBlock ... /> 
content = content.replace(
  'return <PhonicsBlock blockType={blockType} content={content} onAnswer={onAnswer} readOnly={readOnly} />;',
  'return <PhonicsBlock blockType={blockType} content={content} onAnswer={onAnswer} readOnly={readOnly} lessonId={lessonId} blockId={blockId} />;'
);

const oldPhonicsBlockStart = content.indexOf('// ---- Phonics Block (UFLI 8-Step Routine) ----');
const beforePhonicsBlock = content.substring(0, oldPhonicsBlockStart);

const newPhonicsBlock = `// ---- Phonics Block (UFLI 8-Step Routine) ----
function PhonicsBlock({ blockType, content, onAnswer, readOnly, lessonId, blockId }: {
  blockType: BlockType;
  content: any;
  onAnswer?: (value: any) => void;
  readOnly?: boolean;
  lessonId?: string;
  blockId?: string;
}) {
  const [step, setStep] = useState<'I_DO' | 'WE_DO' | 'YOU_DO' | 'CHECK'>('I_DO');
  const [errorCorrectionActive, setErrorCorrectionActive] = useState(false);
  const [correctionStep, setCorrectionStep] = useState<'AFFIRM' | 'MODEL' | 'ECHO' | 'APPLY'>('AFFIRM');
  const [isCompleted, setIsCompleted] = useState(false);

  // Map block type to outcome code
  const getOutcomeCode = (type: string) => {
    switch (type) {
      case 'PHONEME_AWARENESS': return 'WARMUP_STEP1';
      case 'VISUAL_DRILL': return 'WARMUP_STEP2';
      case 'AUDITORY_DRILL': return 'WARMUP_STEP3';
      case 'NEW_GRAPHEME_INTRODUCTION': return 'DECODING_STEP4';
      case 'WORD_WORK': return 'DECODING_STEP5';
      case 'HEART_WORDS': return 'DECODING_STEP6';
      case 'DECODABLE_TEXT': return 'DECODING_STEP7';
      case 'ENCODING': return 'ENCODING_STEP8';
      default: return 'UNKNOWN';
    }
  };

  const submitToEngine = async (correct: boolean) => {
    if (!lessonId || !blockId) return;
    try {
      await fetch(\`/api/lesson/\${lessonId}/submit\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          singleQuestion: true,
          questionId: blockId,
          response: correct ? 'correct' : 'incorrect',
          correct,
          outcomeCode: getOutcomeCode(blockType),
        }),
      });
    } catch (e) {
      console.error('Failed to submit phonics block to engine:', e);
    }
  };

  const handleStudentResponse = async (correct: boolean) => {
    if (correct) {
      if (errorCorrectionActive) {
        if (correctionStep === 'APPLY') {
          setErrorCorrectionActive(false);
          setCorrectionStep('AFFIRM');
          setIsCompleted(true);
          onAnswer?.({ correct: false, step, errorCorrected: true });
        }
      } else {
        await submitToEngine(true);
        setIsCompleted(true);
        onAnswer?.({ correct: true, step });
      }
    } else {
      if (!errorCorrectionActive) {
        await submitToEngine(false);
        setErrorCorrectionActive(true);
        setCorrectionStep('AFFIRM');
      }
    }
  };

  return (
    <div className={styles.interactiveBlock} style={{ borderLeft: '4px solid #f59e0b', background: '#fffbeb', opacity: isCompleted ? 0.7 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: '1.5rem' }}>{BLOCK_TYPE_ICONS[blockType]}</span>
        <h3 style={{ margin: 0, color: '#92400e', fontSize: '1.1rem' }}>{BLOCK_TYPE_LABELS[blockType]}</h3>
        {isCompleted && <span style={{ marginLeft: 'auto', color: '#059669', fontWeight: 'bold' }}>✓ Completed</span>}
      </div>
      
      {/* Explicit Instruction Cycle Indicator */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['I_DO', 'WE_DO', 'YOU_DO', 'CHECK'].map((s) => (
          <div key={s} style={{
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: '0.75rem',
            fontWeight: 700,
            background: step === s ? '#f59e0b' : '#fef3c7',
            color: step === s ? '#fff' : '#b45309',
            cursor: 'pointer'
          }} onClick={() => !readOnly && setStep(s as any)}>
            {s.replace('_', ' ')}
          </div>
        ))}
      </div>

      <div style={{ padding: '12px', background: '#fff', borderRadius: 8, border: '1px solid #fde68a' }}>
        {content?.instruction && <p style={{ fontSize: '0.9rem', marginBottom: 12 }}><strong>Teacher Script:</strong> {content.instruction}</p>}
        {content?.text && <p style={{ fontSize: '1.2rem', textAlign: 'center', margin: '20px 0' }}>{content.text}</p>}
        
        {/* Placeholder for Interactive Elements */}
        {!readOnly && !isCompleted && !errorCorrectionActive && (
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
            <button onClick={() => handleStudentResponse(true)} className={styles.btnPrimary} style={{ background: '#22c55e' }}>Student Correct</button>
            <button onClick={() => handleStudentResponse(false)} className={styles.btnPrimary} style={{ background: '#ef4444' }}>Student Error</button>
          </div>
        )}
      </div>

      {/* Error Correction Protocol UI */}
      {errorCorrectionActive && !isCompleted && (
        <div style={{ marginTop: 16, padding: 12, background: '#fee2e2', borderRadius: 8, border: '1px solid #fca5a5' }}>
          <h4 style={{ margin: '0 0 8px', color: '#b91c1c' }}>🚨 Error Correction Protocol Active</h4>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: correctionStep === 'AFFIRM' ? 700 : 400 }}>1. Affirm</span> ➔
            <span style={{ fontWeight: correctionStep === 'MODEL' ? 700 : 400 }}>2. Model</span> ➔
            <span style={{ fontWeight: correctionStep === 'ECHO' ? 700 : 400 }}>3. Echo</span> ➔
            <span style={{ fontWeight: correctionStep === 'APPLY' ? 700 : 400 }}>4. Apply</span>
          </div>
          
          <div style={{ marginTop: 12, padding: 8, background: '#fff', borderRadius: 4 }}>
            {correctionStep === 'AFFIRM' && <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Teacher:</strong> "That was a good try, but..."</p>}
            {correctionStep === 'MODEL' && <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Teacher:</strong> "Watch me. This sound is /m/."</p>}
            {correctionStep === 'ECHO' && <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Teacher:</strong> "Say it with me: /m/."</p>}
            {correctionStep === 'APPLY' && <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Teacher:</strong> "Now your turn. What sound?"</p>}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            {correctionStep !== 'APPLY' ? (
              <button 
                className={styles.btnPrimary}
                style={{ background: '#b91c1c' }}
                onClick={() => {
                  if (correctionStep === 'AFFIRM') setCorrectionStep('MODEL');
                  else if (correctionStep === 'MODEL') setCorrectionStep('ECHO');
                  else if (correctionStep === 'ECHO') setCorrectionStep('APPLY');
                }}
              >
                Advance Step
              </button>
            ) : (
              <>
                <button onClick={() => handleStudentResponse(true)} className={styles.btnPrimary} style={{ background: '#22c55e' }}>Student Correct Now</button>
                <button onClick={() => setCorrectionStep('AFFIRM')} className={styles.btnPrimary} style={{ background: '#ef4444' }}>Student Error Again (Restart)</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync('src/components/lesson/LessonBlockRenderer.tsx', beforePhonicsBlock + newPhonicsBlock, 'utf-8');
console.log('Update complete');
