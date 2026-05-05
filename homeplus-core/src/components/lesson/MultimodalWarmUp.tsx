'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './lesson.module.css';
import SubmissionFeedback from '../SubmissionFeedback';
import { Mic, Video, FileText, Square, Circle } from 'lucide-react';

interface MultimodalWarmUpProps {
  content: {
    prompt: string;
    imageUrl?: string;
  };
  lessonId: string;
  subjectMode: string;
  gradeLevel: number;
}

export default function MultimodalWarmUp({ content, lessonId, subjectMode, gradeLevel }: MultimodalWarmUpProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'audio' | 'video'>('write');
  const [textResponse, setTextResponse] = useState('');
  
  const [isRecording, setIsRecording] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackData, setFeedbackData] = useState<any>(null);

  // Video/Audio refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  // Clean up media streams
  useEffect(() => {
    return () => {
      stopMediaTracks();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Handle Tab Switch
  useEffect(() => {
    if (activeTab === 'video') {
      startCameraPreview();
    } else {
      stopMediaTracks(); // Turn off camera light if switching away
    }
  }, [activeTab]);

  const stopMediaTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startCameraPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied", err);
    }
  };

  const startRecording = async () => {
    setTextResponse(''); // Clear previous for fresh transcript
    setIsRecording(true);

    try {
      // Audio or Video stream
      let stream = streamRef.current;
      if (!stream && activeTab === 'audio') {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
      }

      if (stream) {
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.start();
      }

      // Initialize SpeechRecognition for auto-transcription
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + ' ';
            }
          }
          if (finalTranscript) {
            setTextResponse(prev => prev + finalTranscript);
          }
        };

        recognition.onend = () => {
          // Restart if still recording (hack for continuous speech)
          if (isRecording) recognition.start();
        };

        recognition.start();
        recognitionRef.current = recognition;
      }
    } catch (err) {
      console.error("Recording failed", err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; // Prevent auto-restart
      recognitionRef.current.stop();
    }
  };

  const handleSubmit = async () => {
    if (!textResponse.trim() || submitting) return;
    setSubmitting(true);
    stopMediaTracks(); // Stop cam/mic once submitted

    try {
      const res = await fetch(`/api/lesson/${lessonId}/ai-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: content.prompt,
          rubricHint: "This is a warm-up. Grade on participation and basic critical thinking.",
          studentResponse: textResponse,
          minLength: 10, // low required length for warmups
          subjectMode,
          gradeLevel,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setFeedbackData(data);
        setSubmitted(true);
      } else {
        console.error('Failed AI fetch');
        setSubmitted(true); // Fallback to submitted
      }
    } catch (err) {
      console.error(err);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Mocking the status expected by SubmissionFeedback
  const aiStatus = feedbackData ? 'COMPLETE' : submitting ? 'PENDING' : 'NONE';

  return (
    <div className={styles.blockCard} style={{ overflow: 'hidden' }}>
      
      {/* Visual Content (Includes fixing user report "Missing Images") */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: '1.05rem', fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>
          {content.prompt || "Think about what you already know..."}
        </p>
        
        {content.imageUrl && (
          <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <img
              src={content.imageUrl}
              alt="Warm-up visual"
              style={{ width: '100%', maxHeight: 380, objectFit: 'cover' }}
            />
          </div>
        )}
      </div>

      {/* Interactive Hub */}
      {!submitted && (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, background: '#f8fafc' }}>
          
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '4px' }}>
            <button
              onClick={() => setActiveTab('write')}
              style={{ flex: 1, padding: 10, background: activeTab === 'write' ? '#fff' : 'transparent', border: 'none', borderRadius: 8, fontWeight: 600, color: activeTab === 'write' ? '#4f46e5' : '#64748b', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, cursor: 'pointer', boxShadow: activeTab === 'write' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
            >
              <FileText size={18} /> Write
            </button>
            <button
              onClick={() => setActiveTab('audio')}
              style={{ flex: 1, padding: 10, background: activeTab === 'audio' ? '#fff' : 'transparent', border: 'none', borderRadius: 8, fontWeight: 600, color: activeTab === 'audio' ? '#4f46e5' : '#64748b', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, cursor: 'pointer', boxShadow: activeTab === 'audio' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
            >
              <Mic size={18} /> Record Audio
            </button>
            <button
              onClick={() => setActiveTab('video')}
              style={{ flex: 1, padding: 10, background: activeTab === 'video' ? '#fff' : 'transparent', border: 'none', borderRadius: 8, fontWeight: 600, color: activeTab === 'video' ? '#4f46e5' : '#64748b', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, cursor: 'pointer', boxShadow: activeTab === 'video' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
            >
              <Video size={18} /> Record Video
            </button>
          </div>

          <div style={{ padding: 16 }}>
            {/* Written Tab */}
            {activeTab === 'write' && (
              <textarea
                value={textResponse}
                onChange={(e) => setTextResponse(e.target.value)}
                placeholder="Type your response here..."
                style={{ width: '100%', minHeight: 120, padding: 12, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.95rem', resize: 'vertical' }}
              />
            )}

            {/* Audio Tab */}
            {activeTab === 'audio' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: isRecording ? '#fee2e2' : '#e0e7ff', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                  {isRecording ? <Mic size={40} color="#dc2626" /> : <Mic size={40} color="#4f46e5" />}
                </div>
                
                {isRecording ? (
                  <button onClick={stopRecording} style={{ padding: '10px 24px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '24px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <Square size={16} fill="#fff" /> Stop Recording
                  </button>
                ) : (
                  <button onClick={startRecording} style={{ padding: '10px 24px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '24px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <Circle size={16} fill="#fff" /> Start Recording
                  </button>
                )}
                
                {/* Live Transcript Preview */}
                <div style={{ marginTop: 24, width: '100%' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', margin: '0 0 8px' }}>LIVE TRANSCRIPT (AI will review this)</p>
                  <textarea
                    value={textResponse}
                    onChange={(e) => setTextResponse(e.target.value)}
                    placeholder={isRecording ? "Listening..." : "Your transcribed speech will appear here. Feel free to edit it!"}
                    style={{ width: '100%', minHeight: 80, padding: 12, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>
            )}

            {/* Video Tab */}
            {activeTab === 'video' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: 480, height: 270, background: '#1e293b', borderRadius: 12, overflow: 'hidden', marginBottom: 16, border: isRecording ? '3px solid #dc2626' : '3px solid transparent', transition: 'border 0.3s' }}>
                  <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                
                {isRecording ? (
                  <button onClick={stopRecording} style={{ padding: '10px 24px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '24px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <Square size={16} fill="#fff" /> Stop Recording
                  </button>
                ) : (
                  <button onClick={startRecording} style={{ padding: '10px 24px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '24px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <Circle size={16} fill="#fff" /> Start Recording
                  </button>
                )}

                {/* Live Transcript Preview */}
                <div style={{ marginTop: 24, width: '100%' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', margin: '0 0 8px' }}>LIVE TRANSCRIPT (AI will review this)</p>
                  <textarea
                    value={textResponse}
                    onChange={(e) => setTextResponse(e.target.value)}
                    placeholder={isRecording ? "Listening..." : "Your transcribed speech will appear here. Feel free to edit it!"}
                    style={{ width: '100%', minHeight: 80, padding: 12, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>
            )}
          </div>

          <div style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', background: '#fff', borderRadius: '0 0 12px 12px' }}>
             <button
                onClick={handleSubmit}
                disabled={!textResponse.trim() || submitting || isRecording}
                style={{
                  padding: '10px 24px',
                  borderRadius: 8,
                  border: 'none',
                  background: submitting || !textResponse.trim() || isRecording ? '#cbd5e1' : '#10b981',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: submitting || !textResponse.trim() || isRecording ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {submitting ? '⏳ Submitting...' : '✓ Submit Response'}
              </button>
          </div>
        </div>
      )}

      {/* AI Feedback View */}
      {submitted && (
        <div style={{ marginTop: 20 }}>
          {!feedbackData && !submitting ? (
             <div style={{ padding: 16, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, color: '#059669', fontWeight: 600 }}>
               ✅ Response Submitted
             </div>
          ) : feedbackData && (
            <div style={{ 
              background: '#ffffff', 
              border: '2px solid #e0e7ff', 
              borderRadius: 12, 
              padding: '24px',
              fontFamily: "'Inter', -apple-system, sans-serif"
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', color: '#1e293b' }}>
                 AI Feedback: Warm-Up
              </h3>
              
              <div style={{ marginBottom: 16, fontSize: '0.95rem', color: '#334155', lineHeight: 1.6 }}>
                {feedbackData.feedback}
              </div>

              {feedbackData.strengths && feedbackData.strengths.length > 0 && (
                <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '14px 16px', marginBottom: 12, borderLeft: '3px solid #22c55e' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#15803d', marginBottom: 6 }}>
                    ✨ What you did well
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.88rem', color: '#166534', lineHeight: 1.6 }}>
                    {feedbackData.strengths.map((st: string, idx: number) => <li key={idx}>{st}</li>)}
                  </ul>
                </div>
              )}

              {feedbackData.improvements && feedbackData.improvements.length > 0 && (
                <div style={{ background: '#fffbeb', borderRadius: 8, padding: '14px 16px', borderColor: '#fcd34d', borderLeft: '3px solid #f59e0b', marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#b45309', marginBottom: 6 }}>
                     What to improve
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.88rem', color: '#92400e', lineHeight: 1.6 }}>
                    {feedbackData.improvements.map((imp: string, idx: number) => <li key={idx}>{imp}</li>)}
                  </ul>
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button
                  onClick={() => setSubmitted(false)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s'
                  }}
                >
                  ✎ Revise Response
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
