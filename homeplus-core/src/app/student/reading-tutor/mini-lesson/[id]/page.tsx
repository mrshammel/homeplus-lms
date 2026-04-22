'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../../reading-tutor.module.css';

type Phase = 'LOADING' | 'LEARN' | 'DECODE' | 'ENCODE' | 'DONE';

interface LessonData {
  explanation: string;
  decodeWords: string[];
  encodeWords: string[];
}

export default function MiniLessonPage() {
  const router = useRouter();
  const params = useParams();
  const gapId = params.id as string;

  const [phase, setPhase] = useState<Phase>('LOADING');
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [conceptName, setConceptName] = useState('');
  const [error, setError] = useState('');

  // Decode State
  const [decodeIndex, setDecodeIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [recognizedWord, setRecognizedWord] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Encode State
  const [encodeIndex, setEncodeIndex] = useState(0);
  const [encodeInput, setEncodeInput] = useState('');
  const [encodeMode, setEncodeMode] = useState<'type' | 'draw'>('type');
  const [encodeFeedback, setEncodeFeedback] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    async function loadLesson() {
      try {
        const res = await fetch('/api/reading-tutor/mini-lesson/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gapId }),
        });
        if (res.ok) {
          const data = await res.json();
          setLesson(data.lesson);
          setConceptName(data.conceptName);
          setPhase('LEARN');
        } else {
          setError('Could not load mini-lesson.');
        }
      } catch {
        setError('Network error loading lesson.');
      }
    }
    loadLesson();
  }, [gapId]);

  // TTS Helper
  const speak = useCallback((text: string, rate = 0.9) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) => /female|samantha|zira/i.test(v.name) && v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    if (phase === 'LEARN' && lesson?.explanation) {
      speak(lesson.explanation);
    }
  }, [phase, lesson, speak]);

  // Decode Logic
  const startListeningWord = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      setRecognizedWord(transcript);
      const target = lesson!.decodeWords[decodeIndex].toLowerCase();
      
      // Simple exact match or includes for now
      if (transcript.includes(target) || transcript.replace(/[^a-z]/g, '') === target.replace(/[^a-z]/g, '')) {
        speak("Great job!");
        setTimeout(() => {
          if (decodeIndex < lesson!.decodeWords.length - 1) {
            setDecodeIndex(prev => prev + 1);
            setRecognizedWord('');
          } else {
            setPhase('ENCODE');
            speak("Now let's practice spelling. Get ready to write the word I say.");
          }
        }, 1500);
      } else {
        speak(`You said ${transcript}. The word is ${target}. Try again!`);
      }
    };

    rec.onend = () => setIsListening(false);
    rec.start();
    setIsListening(true);
    recognitionRef.current = rec;
  };

  // Encode Logic
  const playCurrentEncodeWord = () => {
    if (lesson?.encodeWords[encodeIndex]) {
      speak(lesson.encodeWords[encodeIndex], 0.75); // slower for spelling
    }
  };

  useEffect(() => {
    if (phase === 'ENCODE') {
      setTimeout(playCurrentEncodeWord, 1000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, encodeIndex]);

  const checkSpelling = () => {
    const target = lesson!.encodeWords[encodeIndex].toLowerCase();
    
    // If drawing mode, we assume the teacher/tutor checks it, or we use a basic heuristic 
    // Here we'll just automatically "approve" drawings after they click check for prototype sake
    if (encodeMode === 'draw') {
      setEncodeFeedback('Great drawing! Keep it up.');
      setTimeout(advanceEncode, 2000);
      return;
    }

    if (encodeInput.trim().toLowerCase() === target) {
      setEncodeFeedback('Perfect spelling! ⭐');
      speak("Perfect spelling!");
      setTimeout(advanceEncode, 2000);
    } else {
      setEncodeFeedback(\`Not quite! The word was \${target}.\`);
      speak(\`Not quite! The word was \${target}.\`);
    }
  };

  const advanceEncode = () => {
    setEncodeFeedback('');
    setEncodeInput('');
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    if (encodeIndex < lesson!.encodeWords.length - 1) {
      setEncodeIndex(prev => prev + 1);
    } else {
      finishLesson();
    }
  };

  const finishLesson = async () => {
    setPhase('DONE');
    speak("Awesome work! You completed the mini lesson.");
    try {
      await fetch('/api/reading-tutor/mini-lesson/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gapId }),
      });
    } catch (e) {
      console.error("Failed to resolve gap", e);
    }
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };
  const endDrawing = () => setIsDrawing(false);
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#3b82f6';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  // Render Helpers
  if (error) return <div className={styles.tutorRoot}><div className={styles.card}><h3>Error</h3><p>{error}</p></div></div>;
  if (phase === 'LOADING') return <div className={styles.tutorRoot}><div className={styles.card}><h3>Preparing your Mini-Lesson...</h3></div></div>;

  return (
    <div className={styles.tutorRoot}>
      <div className={styles.sessionLayout}>
        <div className={styles.card} style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '8px' }}>Mini-Lesson: {conceptName}</h2>
          
          {phase === 'LEARN' && (
            <div>
              <p style={{ fontSize: '1.2rem', margin: '24px 0', lineHeight: '1.5' }}>
                {lesson?.explanation}
              </p>
              <button className={styles.btnPrimary} onClick={() => {
                setPhase('DECODE');
                speak("Let's read these words. Click the microphone when you are ready.");
              }}>
                Got it! Let&apos;s Practice &rarr;
              </button>
            </div>
          )}

          {phase === 'DECODE' && (
            <div>
              <h3 style={{ color: '#666', marginBottom: '16px' }}>Part 1: Reading</h3>
              <p>Word {decodeIndex + 1} of {lesson?.decodeWords.length}</p>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', margin: '40px 0', letterSpacing: '4px' }}>
                {lesson?.decodeWords[decodeIndex]}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <button 
                  className={styles.micButton} 
                  data-recording={isListening}
                  onClick={startListeningWord}
                >
                  <div className={styles.micIcon}></div>
                </button>
                {isListening && <p style={{ color: '#ef4444' }}>Listening...</p>}
                {recognizedWord && !isListening && (
                  <p>I heard: <strong>{recognizedWord}</strong></p>
                )}
              </div>
            </div>
          )}

          {phase === 'ENCODE' && (
            <div>
              <h3 style={{ color: '#666', marginBottom: '16px' }}>Part 2: Spelling</h3>
              <p>Word {encodeIndex + 1} of {lesson?.encodeWords.length}</p>
              
              <div style={{ margin: '20px 0' }}>
                <button className={styles.btnSecondary} onClick={playCurrentEncodeWord} style={{ borderRadius: '50%', width: '60px', height: '60px', padding: '0' }}>
                  🔊
                </button>
                <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>Listen</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
                <button 
                  className={encodeMode === 'type' ? styles.btnPrimary : styles.btnSecondary}
                  onClick={() => setEncodeMode('type')}
                >
                  ⌨️ Type
                </button>
                <button 
                  className={encodeMode === 'draw' ? styles.btnPrimary : styles.btnSecondary}
                  onClick={() => setEncodeMode('draw')}
                >
                  ✏️ Draw
                </button>
              </div>

              {encodeMode === 'type' ? (
                <input 
                  type="text" 
                  value={encodeInput}
                  onChange={(e) => setEncodeInput(e.target.value)}
                  style={{ fontSize: '2rem', padding: '12px', width: '80%', textAlign: 'center', borderRadius: '8px', border: '2px solid #ddd' }}
                  placeholder="Type the word..."
                  autoFocus
                />
              ) : (
                <div style={{ border: '2px solid #ddd', borderRadius: '8px', display: 'inline-block', backgroundColor: '#f9fafb' }}>
                  <canvas 
                    ref={canvasRef}
                    width={400} 
                    height={200}
                    onMouseDown={startDrawing}
                    onMouseUp={endDrawing}
                    onMouseMove={draw}
                    onMouseLeave={endDrawing}
                    onTouchStart={startDrawing}
                    onTouchEnd={endDrawing}
                    onTouchMove={draw}
                    style={{ touchAction: 'none', cursor: 'crosshair' }}
                  />
                  <div style={{ padding: '8px', borderTop: '1px solid #ddd', fontSize: '0.8rem', color: '#666' }}>
                    Use your mouse or finger to draw the word
                  </div>
                </div>
              )}

              {encodeFeedback && (
                <div style={{ marginTop: '16px', fontSize: '1.2rem', fontWeight: 'bold', color: encodeFeedback.includes('Perfect') ? '#22c55e' : '#ef4444' }}>
                  {encodeFeedback}
                </div>
              )}

              <div style={{ marginTop: '30px' }}>
                <button className={styles.btnPrimary} onClick={checkSpelling} disabled={!!encodeFeedback}>
                  Check My Answer
                </button>
              </div>
            </div>
          )}

          {phase === 'DONE' && (
            <div>
              <div style={{ fontSize: '4rem', margin: '20px' }}>🎉</div>
              <h3>Mini-Lesson Complete!</h3>
              <p>Your phonics gap has been resolved. You can now read your next passage.</p>
              <div style={{ marginTop: '30px' }}>
                <Link href="/student/reading-tutor" className={styles.btnPrimary}>
                  Back to Dashboard
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
