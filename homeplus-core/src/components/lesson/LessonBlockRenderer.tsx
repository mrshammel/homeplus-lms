'use client';

// ============================================
// Lesson Block Renderer - Home Plus LMS
// ============================================
// Renders individual lesson blocks by type.
// Used inside the universal lesson frame.

import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styles from './lesson.module.css';
import type {
  BlockType,
  TextBlockContent,
  VideoBlockContent,
  ImageBlockContent,
  VocabularyBlockContent,
  WorkedExampleBlockContent,
  FillInBlankBlockContent,
  MatchingBlockContent,
  MultipleChoiceBlockContent,
  ConstructedResponseBlockContent,
  DrawingBlockContent,
  UploadBlockContent,
  MicroCheckBlockContent,
} from '@/lib/lesson-types';

// Lazy-load DrawingCanvas - it's large and only needed for DRAWING blocks
const DrawingCanvas = dynamic(() => import('./DrawingCanvas'), { ssr: false });

interface BlockProps {
  blockType: BlockType;
  content: any; // JSON from DB, typed per block-type
  onAnswer?: (value: any) => void;
  readOnly?: boolean;
  showFeedback?: boolean;
  lessonId?: string; // needed for AI feedback on constructed responses
  blockId?: string;  // block identifier for tracking
  subjectMode?: string; // subject for calibrated AI feedback
  gradeLevel?: number; // grade level for AI calibration
}

export default function LessonBlockRenderer({ blockType, content, onAnswer, readOnly, showFeedback, lessonId, blockId, subjectMode, gradeLevel }: BlockProps) {
  switch (blockType) {
    case 'TEXT':
      return <TextBlock content={content as TextBlockContent} />;
    case 'VIDEO':
      return <VideoBlock content={content as VideoBlockContent} />;
    case 'IMAGE':
      return <ImageBlock content={content as ImageBlockContent} />;
    case 'AI_SUMMARY':
      return <AISummaryBlock content={content} />;
    case 'VOCABULARY':
      return <VocabularyBlock content={content as VocabularyBlockContent} />;
    case 'WORKED_EXAMPLE':
      return <WorkedExampleBlock content={content as WorkedExampleBlockContent} />;
      case 'FILL_IN_BLANK': return <FillInBlankBlock content={content} onAnswer={onAnswer} readOnly={readOnly} lessonId={lessonId} blockId={blockId} />;
      case 'MATCHING': return <MatchingBlock content={content} onAnswer={onAnswer} readOnly={readOnly} lessonId={lessonId} blockId={blockId} />;
      case 'MULTIPLE_CHOICE': return <MultipleChoiceBlock content={content} onAnswer={onAnswer} readOnly={readOnly} lessonId={lessonId} blockId={blockId} />;
    case 'CONSTRUCTED_RESPONSE':
      return <ConstructedResponseBlock content={content as ConstructedResponseBlockContent} onAnswer={onAnswer} readOnly={readOnly} lessonId={lessonId} blockId={blockId} subjectMode={subjectMode} gradeLevel={gradeLevel} />;
    case 'DRAWING':
      return <DrawingCanvas content={content as DrawingBlockContent} lessonId={lessonId || ''} blockId={blockId || ''} onAnswer={onAnswer} readOnly={readOnly} />;
    case 'PHOTO_UPLOAD':
    case 'TAKE_PHOTO':
      return <UploadBlock content={content as UploadBlockContent} type="photo" onAnswer={onAnswer} />;
    case 'VIDEO_UPLOAD':
    case 'TAKE_VIDEO':
      return <UploadBlock content={content as UploadBlockContent} type="video" onAnswer={onAnswer} />;
    case 'FILE_UPLOAD':
      return <UploadBlock content={content as UploadBlockContent} type="file" onAnswer={onAnswer} />;
    case 'MICRO_CHECK':
      return <MicroCheckBlock content={content as MicroCheckBlockContent} onAnswer={onAnswer} />;
    default:
      return <div className={styles.blockCard}><p>Unsupported block type: {blockType}</p></div>;
  }
}

// ---- Read Aloud Hook (Text-to-Speech) ----
// Uses Web Speech API with localStorage-persisted rate preference.
// Returns null controls when speechSynthesis is unavailable.

const TTS_RATE_KEY = 'hpln-tts-rate';
const TTS_VOICE_KEY = 'hpln-tts-voice';

function useReadAloud() {
  const [speaking, setSpeaking] = useState(false);
  const [rate, setRate] = useState(0.9);
  const [voiceURI, setVoiceURI] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load saved rate and voice on mount, and initialize voices list
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedRate = localStorage.getItem(TTS_RATE_KEY);
    if (savedRate) {
      const parsed = parseFloat(savedRate);
      if (!isNaN(parsed) && parsed >= 0.5 && parsed <= 1.5) setRate(parsed);
    }
    const savedVoice = localStorage.getItem(TTS_VOICE_KEY);
    if (savedVoice) setVoiceURI(savedVoice);

    const updateVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    updateVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const updateRate = useCallback((newRate: number) => {
    setRate(newRate);
    if (typeof window !== 'undefined') {
      localStorage.setItem(TTS_RATE_KEY, String(newRate));
    }
  }, []);

  const updateVoice = useCallback((newVoiceURI: string) => {
    setVoiceURI(newVoiceURI);
    if (typeof window !== 'undefined') {
      localStorage.setItem(TTS_VOICE_KEY, newVoiceURI);
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!supported) return;
    // Stop any current speech first
    window.speechSynthesis.cancel();

    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = rate;
    utt.pitch = 1;
    
    // Apply selected voice if valid
    if (voiceURI) {
      const selectedVoice = voices.find(v => v.voiceURI === voiceURI);
      if (selectedVoice) utt.voice = selectedVoice;
    }

    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    utteranceRef.current = utt;
    setSpeaking(true);
    window.speechSynthesis.speak(utt);
  }, [supported, rate, voiceURI, voices]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  return { supported, speaking, speak, stop, rate, updateRate, voiceURI, updateVoice, voices, showSettings, setShowSettings };
}

/** Read Aloud button + settings popup (rate & voice), shared by TEXT and VOCABULARY blocks */
function ReadAloudButton({ getText }: { getText: () => string }) {
  const { supported, speaking, speak, stop, rate, updateRate, voiceURI, updateVoice, voices, showSettings, setShowSettings } = useReadAloud();
  if (!supported) return null;

  return (
    <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 6, zIndex: 2 }}>
      {speaking ? (
        <button
          onClick={stop}
          aria-label="Stop reading"
          title="Stop reading"
          style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: 8,
            padding: '5px 10px',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            transition: 'all 0.15s',
          }}
        >
          ⏹ Stop
        </button>
      ) : (
        <button
          onClick={() => speak(getText())}
          aria-label="Read aloud"
          title="Read this section aloud"
          style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 8,
            padding: '5px 10px',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            transition: 'all 0.15s',
          }}
        >
           Read to Me
        </button>
      )}
      <button
        onClick={() => setShowSettings(!showSettings)}
        aria-label="Adjust voice settings"
        title="Adjust voice settings"
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.85rem',
          color: '#94a3b8',
          padding: '2px 4px',
        }}
      >
        ⚙️
      </button>
      {showSettings && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: 6,
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          padding: '14px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          width: 260,
          zIndex: 10,
        }}>
          {/* Voice Selection */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', margin: '0 0 6px', fontWeight: 600 }}>
              Voice Selection
            </label>
            <select 
              value={voiceURI || ''} 
              onChange={(e) => updateVoice(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 8px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                fontSize: '0.8rem',
                color: '#334155',
                outline: 'none'
              }}
            >
              <option value="">System Default</option>
              {voices.filter(v => v.lang.startsWith('en')).map(v => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name.replace(/English|United States|United Kingdom/g, '').trim()} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Reading Speed */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', margin: '0 0 6px', fontWeight: 600 }}>
              Reading speed: {rate.toFixed(1)}×
            </label>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={rate}
              onChange={(e) => updateRate(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#2563eb' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#94a3b8' }}>
              <span>Slower</span>
              <span>Faster</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Text Block ----
function TextBlock({ content }: { content: TextBlockContent }) {
  if (!content?.html) return null;

  const getPlainText = useCallback(() => {
    // Strip HTML to plain text for speech synthesis
    const div = document.createElement('div');
    div.innerHTML = content.html;
    return div.textContent || div.innerText || '';
  }, [content.html]);

  return (
    <div className={`${styles.blockCard} ${styles.textBlock}`} style={{ position: 'relative' }}>
      <ReadAloudButton getText={getPlainText} />
      <div dangerouslySetInnerHTML={{ __html: content.html }} />
    </div>
  );
}

// ---- Video Block ----
function VideoBlock({ content }: { content: VideoBlockContent }) {
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    // Match watch?v=, youtu.be/, and /embed/ formats
    const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
    return url;
  };

  if (!content?.url) {
    return (
      <div className={styles.blockCard}>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}> Video URL not set yet</p>
      </div>
    );
  }

  return (
    <div className={styles.blockCard}>
      {content.title && <p style={{ fontWeight: 600, color: '#1e293b', margin: '0 0 10px' }}>{content.title}</p>}
      <div className={styles.videoBlock}>
        <iframe src={getEmbedUrl(content.url)} title={content.title || 'Video'} allowFullScreen />
      </div>
      {content.aiSummary && (
        <details style={{
          marginTop: 14,
          background: '#f8fafc',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}>
          <summary style={{
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.88rem',
            color: '#334155',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            userSelect: 'none',
          }}>
            <span style={{ fontSize: '1.1rem' }}></span>
            Video Summary - Read Instead of Watch
          </summary>
          <div style={{
            padding: '4px 16px 14px',
            fontSize: '0.88rem',
            color: '#475569',
            lineHeight: 1.7,
            borderTop: '1px solid #e2e8f0',
          }}>
            {content.aiSummary}
          </div>
        </details>
      )}
    </div>
  );
}

// ---- Image Block ----
function ImageBlock({ content }: { content: ImageBlockContent }) {
  if (!content?.url) {
    return (
      <div className={styles.blockCard}>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>️ Image URL not set yet</p>
      </div>
    );
  }
  return (
    <div className={`${styles.blockCard} ${styles.imageBlock}`}>
      <img src={content.url} alt={content.alt || ''} loading="lazy" />
      {content.caption && <p className={styles.imageCaption}>{content.caption}</p>}
    </div>
  );
}

// ---- AI Summary Block ----
function AISummaryBlock({ content }: { content: { summary: string; source?: string } }) {
  return (
    <div className={styles.blockCard} style={{ borderLeft: '4px solid #8b5cf6' }}>
      <p style={{ fontWeight: 600, color: '#6b21a8', fontSize: '0.82rem', margin: '0 0 6px' }}> AI Summary</p>
      <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>{content.summary}</p>
    </div>
  );
}

// ---- Vocabulary Block ----
function VocabularyBlock({ content }: { content: VocabularyBlockContent }) {
  const getPlainText = useCallback(() => {
    return (content.terms || []).map((t) => {
      let text = `${t.term}. ${t.definition}`;
      if (t.example) text += `. Example: ${t.example}`;
      return text;
    }).join('. ');
  }, [content.terms]);

  return (
    <div className={styles.blockCard} style={{ position: 'relative' }}>
      <ReadAloudButton getText={getPlainText} />
      <p style={{ fontWeight: 700, color: '#166534', fontSize: '0.82rem', margin: '0 0 10px' }}> Key Vocabulary</p>
      {(content.terms || []).map((t, i) => (
        <div key={i} className={styles.vocabCard}>
          <p className={styles.vocabTerm}>{t.term}</p>
          <p className={styles.vocabDef}>{t.definition}</p>
          {t.example && <p className={styles.vocabExample}>Example: {t.example}</p>}
        </div>
      ))}
    </div>
  );
}

// ---- Worked Example Block ----
function WorkedExampleBlock({ content }: { content: WorkedExampleBlockContent }) {
  return (
    <div className={`${styles.blockCard} ${styles.workedExample}`}>
      <p className={styles.workedExampleTitle}> {content.title}</p>
      {(content.steps || []).map((s, i) => (
        <div key={i} className={styles.workedStep}>
          <strong>Step {i + 1}:</strong> {s.instruction}
          {s.detail && <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>{s.detail}</p>}
        </div>
      ))}
    </div>
  );
}

// ---- Fill in the Blank Block (AUTO_AI) ----
function FillInBlankBlock({ content, onAnswer, readOnly, lessonId, blockId }: {
  content: FillInBlankBlockContent;
  onAnswer?: (value: any) => void;
  readOnly?: boolean;
  lessonId?: string;
  blockId?: string;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (lessonId && blockId) {
      const saved = localStorage.getItem(`hpln_fill_${lessonId}_${blockId}`);
      if (saved) {
        try { setAnswers(JSON.parse(saved)); } catch (e) {}
      }
    }
  }, [lessonId, blockId]);

  const handleChange = (id: string, val: string) => {
    if (checked) return;
    const next = { ...answers, [id]: val };
    setAnswers(next);
    if (lessonId && blockId) {
      localStorage.setItem(`hpln_fill_${lessonId}_${blockId}`, JSON.stringify(next));
    }
  };

  const allFilled = (content.blanks || []).every((b) => (answers[b.id] || '').trim().length > 0);

  const handleCheck = () => {
    const res: Record<string, boolean> = {};
    for (const b of content.blanks || []) {
      const studentAnswer = (answers[b.id] || '').trim().toLowerCase();
      const correctAnswer = b.correctAnswer.trim().toLowerCase();
      // Accept answers that are close enough (handle plurals, minor spelling)
      res[b.id] = studentAnswer === correctAnswer ||
        correctAnswer.includes(studentAnswer) ||
        studentAnswer.includes(correctAnswer);
    }
    setResults(res);
    setChecked(true);
    const correctCount = Object.values(res).filter(Boolean).length;
    onAnswer?.({ answers, results: res, score: correctCount, total: (content.blanks || []).length });
  };

  const correctCount = Object.values(results).filter(Boolean).length;
  const total = (content.blanks || []).length;

  return (
    <div className={styles.interactiveBlock}>
      <p className={styles.interactivePrompt}>{content.prompt}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(content.blanks || []).map((b) => (
          <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {b.hint && <span style={{ fontSize: '0.82rem', color: '#64748b', minWidth: 80 }}>{b.hint}:</span>}
            <input
              className={styles.fillBlank}
              value={answers[b.id] || ''}
              onChange={(e) => handleChange(b.id, e.target.value)}
              disabled={readOnly || checked}
              placeholder="..."
              style={{
                borderColor: checked
                  ? results[b.id] ? '#22c55e' : '#ef4444'
                  : undefined,
                background: checked
                  ? results[b.id] ? '#f0fdf4' : '#fef2f2'
                  : undefined,
              }}
            />
            {checked && (
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                {results[b.id]
                  ? <span style={{ color: '#059669' }}>✓</span>
                  : <span style={{ color: '#dc2626' }}>✗ <span style={{ fontWeight: 400, fontSize: '0.78rem', color: '#475569' }}>{b.correctAnswer}</span></span>
                }
              </span>
            )}
          </div>
        ))}
      </div>

      {!checked && (
        <button
          onClick={handleCheck}
          disabled={!allFilled}
          className={styles.btnPrimary}
          style={{
            marginTop: 14,
            background: allFilled ? '#2563eb' : '#cbd5e1',
            cursor: allFilled ? 'pointer' : 'not-allowed',
          }}
        >
          ✓ Check Answers
        </button>
      )}

      {checked && (
        <div style={{
          marginTop: 12,
          padding: '10px 14px',
          borderRadius: 10,
          background: correctCount === total ? '#f0fdf4' : '#fffbeb',
          border: `1px solid ${correctCount === total ? '#86efac' : '#fde68a'}`,
        }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0, color: correctCount === total ? '#059669' : '#92400e' }}>
            {correctCount === total
              ? ' All correct!'
              : `${correctCount}/${total} correct - review the answers above.`}
          </p>
        </div>
      )}
    </div>
  );
}

// ---- Matching Block (AUTO_AI) ----
function MatchingBlock({ content, onAnswer, readOnly, lessonId, blockId }: {
  content: MatchingBlockContent;
  onAnswer?: (value: any) => void;
  readOnly?: boolean;
  lessonId?: string;
  blockId?: string;
}) {
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [rights, setRights] = useState<string[]>([]);
  
  useEffect(() => {
    if (lessonId && blockId) {
      const saved = localStorage.getItem(`hpln_match_${lessonId}_${blockId}`);
      if (saved) {
        try { setMatches(JSON.parse(saved)); } catch (e) {}
      }
    }
    const uniqueRights = Array.from(new Set((content.pairs || []).map((p) => p.right)));
    setRights(uniqueRights.sort(() => Math.random() - 0.5));
  }, [content.pairs, lessonId, blockId]);

  const handleSelect = (left: string, right: string) => {
    if (readOnly || checked) return;
    const next = { ...matches, [left]: right };
    setMatches(next);
    if (lessonId && blockId) {
      localStorage.setItem(`hpln_match_${lessonId}_${blockId}`, JSON.stringify(next));
    }
    
    if (results[left] === false) {
      const newResults = { ...results };
      delete newResults[left];
      setResults(newResults);
    }
  };

  const allMatched = (content.pairs || []).every((p) => matches[p.left]);

  const handleCheck = () => {
    const res: Record<string, boolean> = {};
    for (const p of content.pairs || []) {
      res[p.left] = matches[p.left] === p.right;
    }
    setResults(res);
    
    const correctCount = Object.values(res).filter(Boolean).length;
    const total = (content.pairs || []).length;
    
    if (correctCount === total) {
      setChecked(true);
      onAnswer?.({ matches, results: res, score: correctCount, total });
    } else {
      setFailedAttempts(prev => prev + 1);
    }
  };

  const handleHint = () => {
    // Find first incorrect or missing match
    const target = (content.pairs || []).find(p => matches[p.left] !== p.right);
    if (target) {
      const next = { ...matches, [target.left]: target.right };
      setMatches(next);
      const newRes = { ...results, [target.left]: true };
      setResults(newRes);
    }
  };

  const handleSkip = () => {
    const perfect: Record<string, string> = {};
    const res: Record<string, boolean> = {};
    for (const p of content.pairs || []) {
      perfect[p.left] = p.right;
      res[p.left] = true;
    }
    setMatches(perfect);
    setResults(res);
    setChecked(true);
    onAnswer?.({ matches: perfect, results: res, score: 0, skipped: true, total: (content.pairs || []).length });
  };

  const correctCount = Object.values(results).filter(Boolean).length;
  const total = (content.pairs || []).length;

  return (
    <div className={styles.interactiveBlock}>
      <p className={styles.interactivePrompt}>{content.instruction || 'Match the items:'}</p>
      {(content.pairs || []).map((p, i) => {
        const hasResult = results[p.left] !== undefined;
        const isCorrect = results[p.left];
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ flex: '1 1 150px', fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>{p.left}</span>
            <span style={{ color: '#94a3b8' }}>&rarr;</span>
            <select
              value={matches[p.left] || ''}
              onChange={(e) => handleSelect(p.left, e.target.value)}
              disabled={readOnly || checked || isCorrect} // Disable if they got it right, or if fully done
              style={{
                flex: '1 1 150px',
                padding: '6px 10px',
                fontSize: '0.85rem',
                borderRadius: 8,
                border: `1.5px solid ${hasResult ? (isCorrect ? '#22c55e' : '#ef4444') : '#e2e8f0'}`,
                background: hasResult ? (isCorrect ? '#f0fdf4' : '#fef2f2') : '#fff',
              }}
            >
              <option value="">Select...</option>
              {rights.map((r, j) => <option key={j} value={r}>{r}</option>)}
            </select>
            {hasResult && (
              <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: 20 }}>
                {isCorrect
                  ? <span style={{ color: '#059669' }}>✓</span>
                  : <span style={{ color: '#dc2626' }}>✗</span>
                }
              </span>
            )}
            {checked && !isCorrect && (
              <span style={{ fontSize: '0.75rem', color: '#6366f1', fontStyle: 'italic' }}>&rarr; {p.right}</span>
            )}
          </div>
        );
      })}

      {!checked && (
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button
            onClick={handleCheck}
            disabled={!allMatched}
            className={styles.btnPrimary}
            style={{
              flex: 1,
              background: allMatched ? '#2563eb' : '#cbd5e1',
              cursor: allMatched ? 'pointer' : 'not-allowed',
            }}
          >
            ✓ Check Answers
          </button>
          {failedAttempts >= 2 && (
            <button
              onClick={handleHint}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                fontSize: '0.85rem',
                fontWeight: 600,
                border: '1px solid #eab308',
                background: '#fef08a',
                color: '#854d0e',
                cursor: 'pointer',
              }}
            >
              💡 Hint
            </button>
          )}
          {failedAttempts >= 4 && (
            <button
              onClick={handleSkip}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                fontSize: '0.85rem',
                fontWeight: 600,
                border: '1px solid #cbd5e1',
                background: '#f1f5f9',
                color: '#64748b',
                cursor: 'pointer',
              }}
            >
              ⏭️ Skip
            </button>
          )}
        </div>
      )}

      {(checked || failedAttempts > 0) && (
        <div style={{
          marginTop: 12,
          padding: '10px 14px',
          borderRadius: 10,
          background: correctCount === total ? '#f0fdf4' : '#fffbeb',
          border: `1px solid ${correctCount === total ? '#86efac' : '#fde68a'}`,
        }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0, color: correctCount === total ? '#059669' : '#92400e' }}>
            {correctCount === total
              ? ' All correct!'
              : `${correctCount}/${total} correct — review the feedback below.`}
          </p>
          {/* Per-pair feedback for incorrect answers */}
          {correctCount < total && (
            <div style={{ marginTop: 10 }}>
              {(content.pairs || []).filter(p => results[p.left] === false).map((p, i) => (
                <div key={i} style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 8,
                  padding: '8px 12px',
                  marginBottom: 6,
                  fontSize: '0.82rem',
                  lineHeight: 1.5,
                }}>
                  <p style={{ margin: 0, color: '#991b1b', fontWeight: 600 }}>
                    ✗ <strong>{p.left}</strong> → You selected: <em>{matches[p.left]}</em>
                  </p>
                  <p style={{ margin: '4px 0 0', color: '#059669', fontWeight: 600 }}>
                    ✓ Correct answer: <strong>{p.right}</strong>
                  </p>
                  <p style={{ margin: '4px 0 0', color: '#475569', fontStyle: 'italic' }}>
                    💡 Think about it: &quot;{p.left}&quot; connects to &quot;{p.right}&quot; — try to remember this pairing for next time!
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---- Multiple Choice Block (AUTO_AI) ----
function MultipleChoiceBlock({ content, onAnswer, readOnly, lessonId, blockId }: {
  content: MultipleChoiceBlockContent;
  onAnswer?: (value: any) => void;
  readOnly?: boolean;
  lessonId?: string;
  blockId?: string;
}) {
  const [selected, setSelected] = useState<string>('');
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (lessonId && blockId) {
      const saved = localStorage.getItem(`hpln_mc_${lessonId}_${blockId}`);
      if (saved) setSelected(saved);
    }
  }, [lessonId, blockId]);

  const handleSelect = (val: string) => {
    if (readOnly || checked) return;
    setSelected(val);
    if (lessonId && blockId) {
      localStorage.setItem(`hpln_mc_${lessonId}_${blockId}`, val);
    }
  };

  const handleCheck = () => {
    setChecked(true);
    const correct = !!content.options?.find((o) => o.value === selected)?.correct;
    onAnswer?.({ selected, correct });
  };

  const selectedOpt = content.options?.find((o) => o.value === selected);
  const isCorrect = selectedOpt?.correct;

  return (
    <div className={styles.interactiveBlock}>
      <p className={styles.interactivePrompt}>{content.question}</p>
      {(content.options || []).map((opt, i) => {
        let cls = styles.mcOption;
        if (selected === opt.value) cls += ' ' + styles.mcOptionSelected;
        if (checked && selected === opt.value) {
          cls += ' ' + (opt.correct ? styles.mcOptionCorrect : styles.mcOptionIncorrect);
        }
        if (checked && opt.correct) {
          cls += ' ' + styles.mcOptionCorrect;
        }

        return (
          <div key={i} className={cls} onClick={() => handleSelect(opt.value)} style={{ cursor: checked ? 'default' : 'pointer' }}>
            <div className={styles.mcRadio} style={selected === opt.value ? { background: '#2563eb', borderColor: '#2563eb' } : {}} />
            <span>{opt.label}</span>
            {checked && opt.correct && <span style={{ marginLeft: 'auto', color: '#059669', fontWeight: 700, fontSize: '0.8rem' }}>✓ Correct</span>}
          </div>
        );
      })}

      {!checked && selected && (
        <button onClick={handleCheck} className={styles.btnPrimary} style={{ marginTop: 10 }}>
          ✓ Check Answer
        </button>
      )}

      {checked && (
        <div style={{
          marginTop: 10,
          padding: '10px 14px',
          borderRadius: 10,
          background: isCorrect ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${isCorrect ? '#86efac' : '#fca5a5'}`,
        }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0, color: isCorrect ? '#059669' : '#dc2626' }}>
            {isCorrect ? '✓ Correct!' : '✗ Not quite.'}
          </p>
          {content.explanation && (
            <p style={{ fontSize: '0.82rem', color: '#475569', margin: '6px 0 0', lineHeight: 1.5 }}>
               {content.explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ---- Constructed Response Block (with Calibrated AI Feedback) ----
interface AIFeedback {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  nextStep?: string;
  criteriaScores?: Record<string, number>;
  disclaimer: string;
  flagForTeacher?: boolean;
  relevanceScore?: number;
}

export function ConstructedResponseBlock({ content, onAnswer, readOnly, lessonId, blockId, subjectMode, gradeLevel }: {
  content: ConstructedResponseBlockContent;
  onAnswer?: (value: any) => void;
  readOnly?: boolean;
  lessonId?: string;
  blockId?: string;
  subjectMode?: string;
  gradeLevel?: number;
}) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<AIFeedback | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isPasted, setIsPasted] = useState(false);

  useEffect(() => {
    if (lessonId && blockId) {
      const saved = localStorage.getItem(`hpln_essay_${lessonId}_${blockId}`);
      if (saved) setText(saved);
    }
  }, [lessonId, blockId]);

  const handleTextChange = (val: string) => {
    setText(val);
    if (lessonId && blockId) {
      localStorage.setItem(`hpln_essay_${lessonId}_${blockId}`, val);
    }
  };

  const minLen = content.minLength || 20;
  const isLongEnough = text.trim().split(/\s+/).filter(Boolean).length >= Math.max(Math.floor(minLen * 0.15), 3);

  const handleSubmit = useCallback(async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);

    // If no lessonId, still mark as submitted (fallback)
    if (!lessonId) {
      setSubmitted(true);
      onAnswer?.(text);
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/lesson/${lessonId}/ai-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: content.prompt,
          rubricHint: content.rubricHint || '',
          studentResponse: text,
          minLength: content.minLength,
          minExpectedWords: content.minExpectedWords,
          teacherReviewRequired: content.teacherReviewRequired,
          subjectMode: subjectMode || 'GENERAL',
          gradeLevel: gradeLevel || 6,
          isPasted: isPasted,
        }),
      });

      if (res.ok) {
        const data: AIFeedback = await res.json();
        setFeedback(data);
        setSubmitted(true);
        onAnswer?.(text); // mark block as complete
      } else {
        console.error('AI feedback failed:', await res.text());
        // Still mark as complete on failure
        setSubmitted(true);
        onAnswer?.(text);
      }
    } catch (e) {
      console.error('AI feedback error:', e);
      setSubmitted(true);
      onAnswer?.(text);
    } finally {
      setSubmitting(false);
    }
  }, [text, submitting, lessonId, content, onAnswer, subjectMode]);

  // Score badge color
  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: '#f0fdf4', border: '#86efac', text: '#059669' };
    if (score >= 60) return { bg: '#eff6ff', border: '#93c5fd', text: '#2563eb' };
    if (score >= 40) return { bg: '#fefce8', border: '#fde047', text: '#ca8a04' };
    return { bg: '#fef2f2', border: '#fca5a5', text: '#dc2626' };
  };

  return (
    <div className={styles.interactiveBlock}>
      <p className={styles.interactivePrompt}>{content.prompt}</p>
      {content.rubricHint && (
        <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 8px' }}>
          Form: <strong>What your response should include:</strong> {content.rubricHint}
        </p>
      )}
      <textarea
        className={styles.textArea}
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        onPaste={() => setIsPasted(true)}
        disabled={readOnly || submitted}
        placeholder="Write your response..."
        style={{
          minHeight: content.minLength && content.minLength > 100 ? 180 : 120,
          opacity: submitted ? 0.85 : 1,
        }}
      />

      {/* Word count indicator */}
      {!submitted && text.trim().length > 0 && (
        <p style={{ fontSize: '0.75rem', color: isLongEnough ? '#059669' : '#94a3b8', margin: '4px 0 0', textAlign: 'right' }}>
          {text.trim().split(/\s+/).filter(Boolean).length} words
          {!isLongEnough && ` - aim for more detail`}
        </p>
      )}

      {/* Submit button */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || submitting}
          style={{
            marginTop: 12,
            padding: '10px 24px',
            borderRadius: 10,
            border: 'none',
            background: submitting ? '#94a3b8' : isLongEnough ? '#2563eb' : '#cbd5e1',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: submitting || !isLongEnough ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {submitting ? (
            <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', fontSize: '1rem' }}>⏳</span> Getting feedback...</>
          ) : (
            <>✓ Submit for Feedback</>
          )}
        </button>
      )}

      {/* AI Feedback Display */}
      {feedback && (
        <div style={{
          marginTop: 16,
          border: `1.5px solid ${getScoreColor(feedback.score).border}`,
          borderRadius: 12,
          overflow: 'hidden',
        }}>
          {/* Score header */}
          <div style={{
            background: getScoreColor(feedback.score).bg,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#fff',
                border: `2px solid ${getScoreColor(feedback.score).border}`,
                fontWeight: 800,
                fontSize: '0.88rem',
                color: getScoreColor(feedback.score).text,
              }}>
                {feedback.score}%
              </span>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', margin: 0 }}>
                   AI Feedback
                </p>
                <p style={{ fontSize: '0.82rem', color: '#475569', margin: '2px 0 0' }}>
                  {feedback.feedback}
                </p>
              </div>
            </div>
          </div>

          {/* Strengths + Improvements */}
          <div style={{ padding: '14px 18px' }}>
            {feedback.strengths.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <p style={{ fontWeight: 700, fontSize: '0.82rem', color: '#059669', margin: '0 0 4px' }}> Strengths:</p>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.82rem', color: '#334155', lineHeight: 1.6 }}>
                  {feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
            {feedback.improvements.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <p style={{ fontWeight: 700, fontSize: '0.82rem', color: '#d97706', margin: '0 0 4px' }}> To Improve:</p>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.82rem', color: '#334155', lineHeight: 1.6 }}>
                  {feedback.improvements.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}

            {/* Next Step */}
            {feedback.nextStep && (
              <div style={{
                marginBottom: 10,
                padding: '10px 14px',
                background: '#eff6ff',
                borderRadius: 8,
                border: '1px solid #bfdbfe',
              }}>
                <p style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1d4ed8', margin: '0 0 2px' }}> Next Step:</p>
                <p style={{ fontSize: '0.82rem', color: '#334155', margin: 0, lineHeight: 1.5 }}>{feedback.nextStep}</p>
              </div>
            )}

            {/* Teacher flag - shown when scorer flags response as borderline */}
            {feedback.flagForTeacher && (
              <div style={{
                marginTop: 10,
                padding: '10px 14px',
                background: '#fefce8',
                borderRadius: 8,
                border: '1px solid #fde68a',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <span style={{ fontSize: '1.1rem' }}>Form:</span>
                <p style={{ fontSize: '0.78rem', color: '#92400e', margin: 0, lineHeight: 1.5 }}>
                  <strong>Teacher Review Requested:</strong> Your teacher will look at this response to give you personalized feedback.
                </p>
              </div>
            )}

            {/* Teacher review disclaimer - always shown */}
            <div style={{
              marginTop: 10,
              padding: '10px 14px',
              background: '#f8fafc',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span style={{ fontSize: '1.1rem' }}>Teacher:</span>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                <strong>Note:</strong> {feedback.disclaimer || 'This is AI-generated feedback to help you improve. Your final grade will be reviewed and assigned by your teacher.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Submitted without feedback (error case) */}
      {submitted && !feedback && (
        <div style={{ marginTop: 12, padding: '10px 14px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #86efac' }}>
          <p style={{ fontSize: '0.85rem', color: '#059669', margin: 0, fontWeight: 600 }}>
            ✅ Response submitted!
          </p>
          <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '4px 0 0' }}>
            Teacher: Your final grade will be reviewed and assigned by your teacher.
          </p>
        </div>
      )}
    </div>
  );
}

// ---- Drawing Block ----
// DrawingBlock removed - replaced by DrawingCanvas component (./DrawingCanvas.tsx)

// ---- Upload Block (photo/video/file) ----
function UploadBlock({ content, type, onAnswer }: {
  content: UploadBlockContent;
  type: 'photo' | 'video' | 'file';
  onAnswer?: (value: any) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const icons = { photo: '', video: '', file: '' };
  const accept = type === 'photo' ? 'image/*' : type === 'video' ? 'video/*' : (content.acceptedTypes || ['*']).join(',');
  const captureAttr = type === 'photo' || type === 'video' ? 'environment' : undefined;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onAnswer?.({ fileName: file.name, fileSize: file.size, fileType: file.type });
    }
  };

  return (
    <div className={styles.interactiveBlock}>
      <p className={styles.interactivePrompt}>{content.instruction}</p>
      <div className={styles.uploadZone} onClick={() => inputRef.current?.click()}>
        <div className={styles.uploadIcon}>{icons[type]}</div>
        {fileName ? (
          <p className={styles.uploadText} style={{ color: '#059669', fontWeight: 600 }}>✓ {fileName}</p>
        ) : (
          <>
            <p className={styles.uploadText}>
              {type === 'file' ? 'Click to upload a file or scanned document' : `Click to ${type === 'photo' ? 'take or upload a photo' : 'record or upload a video'}`}
            </p>
            <p className={styles.uploadHint}>
              {type === 'file'
                ? 'Supports PDF, images, and common document formats'
                : type === 'photo'
                ? 'JPG, PNG, or other image formats'
                : 'MP4, MOV, or other video formats'}
              {content.maxSizeMb ? ` (max ${content.maxSizeMb}MB)` : ''}
            </p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        capture={captureAttr as any}
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}

// ---- Micro Check Block ----
function MicroCheckBlock({ content, onAnswer }: {
  content: MicroCheckBlockContent;
  onAnswer?: (value: any) => void;
}) {
  const [selected, setSelected] = useState<string>('');
  const [checked, setChecked] = useState(false);

  const handleCheck = () => {
    setChecked(true);
    const correct = content.options.find((o) => o.correct)?.value === selected;
    onAnswer?.({ selected, correct });
  };

  return (
    <div className={styles.interactiveBlock} style={{ borderLeft: '4px solid #8b5cf6' }}>
      <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#7c3aed', margin: '0 0 6px' }}>❓ Quick Check</p>
      <p className={styles.interactivePrompt}>{content.question}</p>
      {content.options.map((opt, i) => {
        let cls = styles.mcOption;
        if (selected === opt.value) cls += ' ' + styles.mcOptionSelected;
        if (checked && selected === opt.value) {
          cls += ' ' + (opt.correct ? styles.mcOptionCorrect : styles.mcOptionIncorrect);
        }

        return (
          <div key={i} className={cls} onClick={() => !checked && setSelected(opt.value)}>
            <div className={styles.mcRadio} style={selected === opt.value ? { background: '#7c3aed', borderColor: '#7c3aed' } : {}} />
            <span>{opt.label}</span>
          </div>
        );
      })}
      {!checked && selected && (
        <button onClick={handleCheck} className={styles.btnPrimary} style={{ marginTop: 10, background: '#7c3aed' }}>
          Check Answer
        </button>
      )}
      {checked && content.explanation && (
        <p style={{ fontSize: '0.82rem', color: '#475569', marginTop: 10, padding: '8px 12px', background: '#faf5ff', borderRadius: 8 }}>
           {content.explanation}
        </p>
      )}
    </div>
  );
}
