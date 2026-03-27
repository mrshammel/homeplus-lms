'use client';

// ============================================
// ReviewClient — Interactive Review Component
// ============================================
// Client component that handles the review quiz flow:
// 1. Loads review queue items with questions from API
// 2. Presents one skill at a time with its questions
// 3. Submits answers and shows mastery feedback
// 4. Advances to next skill or shows completion

import { useState, useEffect, useCallback } from 'react';
import styles from '../student.module.css';

// ─── Types ───

interface ReviewQuestion {
  id: string;
  text: string;
  type: string;
  options: Array<{ value: string; label: string; correct?: boolean }>;
  difficulty: number;
}

interface ReviewItem {
  itemId: string;
  skillId: string;
  skillTitle: string;
  skillCode: string;
  priority: number;
  isOverdue: boolean;
  questions: ReviewQuestion[];
}

interface MasteryUpdate {
  skillId: string;
  skillTitle: string;
  newState: string;
  newScore: number;
}

interface SubmitResult {
  correct: number;
  total: number;
  passed: boolean;
  feedback: string;
  masteryUpdate: MasteryUpdate | null;
}

interface SkillSummaryItem {
  id: string;
  code: string;
  title: string;
  masteryState: string;
  masteryScore: number;
}

type Phase = 'loading' | 'ready' | 'reviewing' | 'result' | 'complete' | 'empty';

// ─── Component ───

export default function ReviewClient({
  initialReviewDue,
  initialWeakest,
  initialStrongest,
}: {
  initialReviewDue: number;
  initialWeakest: SkillSummaryItem[];
  initialStrongest: SkillSummaryItem[];
}) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [lastResult, setLastResult] = useState<SubmitResult | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load review items
  const loadReviewItems = useCallback(async () => {
    setPhase('loading');
    setError(null);
    try {
      const res = await fetch('/api/review/questions');
      if (!res.ok) throw new Error('Failed to load review items');
      const data = await res.json();

      // Filter to items that have questions
      const itemsWithQuestions = (data.reviewItems || []).filter(
        (item: ReviewItem) => item.questions.length > 0,
      );

      setReviewItems(itemsWithQuestions);
      setCompletedCount(data.completedToday || 0);
      setCurrentIndex(0);
      setAnswers({});

      if (itemsWithQuestions.length === 0) {
        setPhase('empty');
      } else {
        setPhase('ready');
      }
    } catch (err: any) {
      console.error('[ReviewClient] Load error:', err);
      setError(err?.message || 'Failed to load review data');
      setPhase('empty');
    }
  }, []);

  useEffect(() => {
    loadReviewItems();
  }, [loadReviewItems]);

  // Current item
  const currentItem = reviewItems[currentIndex] || null;

  // Handle answer selection
  const selectAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  // Submit current review item
  const submitReview = async () => {
    if (!currentItem || submitting) return;
    setSubmitting(true);
    setError(null);

    const answerArray = currentItem.questions.map((q) => ({
      questionId: q.id,
      response: answers[q.id] || '',
    }));

    try {
      const res = await fetch('/api/review/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: currentItem.itemId,
          answers: answerArray,
        }),
      });

      if (!res.ok) throw new Error('Submit failed');
      const result: SubmitResult = await res.json();
      setLastResult(result);
      setCompletedCount((prev) => prev + 1);
      setPhase('result');
    } catch (err: any) {
      setError(err?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  // Advance to next item
  const nextItem = () => {
    setLastResult(null);
    setAnswers({});
    if (currentIndex + 1 < reviewItems.length) {
      setCurrentIndex((prev) => prev + 1);
      setPhase('reviewing');
    } else {
      setPhase('complete');
    }
  };

  // Start reviewing
  const startReview = () => {
    setPhase('reviewing');
  };

  // ─── Render ───

  // Loading state
  if (phase === 'loading') {
    return (
      <div className={styles.dashCard} style={{ textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ fontSize: '2rem', marginBottom: 12, animation: 'spin 1s linear infinite' }}>🔄</div>
        <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#475569' }}>Loading review items...</div>
        <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  // Empty state — no items to review
  if (phase === 'empty') {
    return (
      <div className={styles.dashGrid}>
        <div className={styles.dashCard} style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#059669', marginBottom: 6 }}>
            All caught up!
          </div>
          <div style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: 20, lineHeight: 1.5 }}>
            {error
              ? 'No review questions available right now. Complete more lessons to build your review queue!'
              : 'You have no skills due for review right now. Keep up the great work!'}
          </div>
          <button
            onClick={loadReviewItems}
            style={{
              padding: '10px 24px', background: 'linear-gradient(135deg, #6366f1, #818cf8)',
              color: '#fff', fontSize: '0.85rem', fontWeight: 700, borderRadius: 12,
              border: 'none', cursor: 'pointer',
            }}
          >
            🔄 Check Again
          </button>
        </div>

        {/* Skill summary cards */}
        {initialWeakest.length > 0 && (
          <div className={styles.dashCard}>
            <h3 className={styles.cardTitle}>📌 Focus Areas</h3>
            {initialWeakest.map((skill) => (
              <div key={skill.id} className={styles.skillItem}>
                <span className={styles.skillItemDot} style={{ background: getMasteryColor(skill.masteryState) }} />
                <span className={styles.skillItemName}>{skill.title}</span>
                <span className={styles.skillItemScore} style={{ background: getMasteryBg(skill.masteryState), color: getMasteryColor(skill.masteryState) }}>
                  {Math.round(skill.masteryScore * 100)}%
                </span>
              </div>
            ))}
          </div>
        )}

        {initialStrongest.length > 0 && (
          <div className={styles.dashCard}>
            <h3 className={styles.cardTitle}>💪 Strongest Skills</h3>
            {initialStrongest.map((skill) => (
              <div key={skill.id} className={styles.skillItem}>
                <span className={styles.skillItemDot} style={{ background: getMasteryColor(skill.masteryState) }} />
                <span className={styles.skillItemName}>{skill.title}</span>
                <span className={styles.skillItemScore} style={{ background: getMasteryBg(skill.masteryState), color: getMasteryColor(skill.masteryState) }}>
                  {Math.round(skill.masteryScore * 100)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Ready state — overview before starting
  if (phase === 'ready') {
    return (
      <div className={styles.dashCard} style={{ textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🧠</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a2137', marginBottom: 8 }}>
          Review Session Ready
        </div>
        <div style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: 6 }}>
          You have <strong>{reviewItems.length}</strong> skill{reviewItems.length !== 1 ? 's' : ''} to review today.
        </div>
        <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: 24 }}>
          Answer the questions to keep your skills sharp!
        </div>

        {/* Preview of skills to review */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 400, margin: '0 auto 24px' }}>
          {reviewItems.map((item, i) => (
            <div key={item.itemId} className={styles.skillItem} style={{ justifyContent: 'flex-start' }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: item.isOverdue ? '#fef3c7' : '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: item.isOverdue ? '#d97706' : '#059669', flexShrink: 0 }}>
                {i + 1}
              </span>
              <span className={styles.skillItemName}>{item.skillTitle}</span>
              <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '2px 8px', borderRadius: 8, background: item.isOverdue ? '#fef3c7' : '#f1f5f9', color: item.isOverdue ? '#d97706' : '#64748b' }}>
                {item.questions.length}Q{item.isOverdue ? ' · Overdue' : ''}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={startReview}
          style={{
            padding: '14px 36px', background: 'linear-gradient(135deg, #059669, #10b981)',
            color: '#fff', fontSize: '0.95rem', fontWeight: 700, borderRadius: 14,
            border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
            transition: 'all 0.18s',
          }}
        >
          Start Review →
        </button>
      </div>
    );
  }

  // Reviewing state — quiz questions
  if (phase === 'reviewing' && currentItem) {
    const allAnswered = currentItem.questions.every((q) => answers[q.id]);

    return (
      <div>
        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${Math.round(((currentIndex) / reviewItems.length) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #059669, #34d399)', borderRadius: 4, transition: 'width 0.4s ease' }} />
          </div>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' }}>
            {currentIndex + 1} of {reviewItems.length}
          </span>
        </div>

        <div className={styles.dashCard} style={{ padding: '28px 24px' }}>
          {/* Skill header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #f0f2f5' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: currentItem.isOverdue ? 'linear-gradient(135deg, #f59e0b, #fbbf24)' : 'linear-gradient(135deg, #6366f1, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>
              {currentIndex + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#1a2137' }}>{currentItem.skillTitle}</div>
              <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: 2 }}>
                {currentItem.skillCode} · {currentItem.questions.length} question{currentItem.questions.length !== 1 ? 's' : ''}
                {currentItem.isOverdue && <span style={{ color: '#d97706', marginLeft: 8 }}>⏰ Overdue</span>}
              </div>
            </div>
          </div>

          {/* Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {currentItem.questions.map((q, qIdx) => (
              <div key={q.id}>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1a2137', marginBottom: 12 }}>
                  <span style={{ color: '#94a3b8', marginRight: 6 }}>Q{qIdx + 1}.</span>
                  {q.text}
                </div>

                {q.type === 'MULTIPLE_CHOICE' && q.options ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(q.options as Array<{ value: string; label: string }>).map((opt) => {
                      const isSelected = answers[q.id] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => selectAnswer(q.id, opt.value)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '12px 16px', borderRadius: 12,
                            border: `2px solid ${isSelected ? '#6366f1' : '#e2e8f0'}`,
                            background: isSelected ? '#eef2ff' : '#fff',
                            cursor: 'pointer', textAlign: 'left',
                            transition: 'all 0.15s ease',
                            fontSize: '0.85rem', color: '#1a2137',
                          }}
                        >
                          <span style={{
                            width: 24, height: 24, borderRadius: '50%',
                            border: `2px solid ${isSelected ? '#6366f1' : '#d1d5db'}`,
                            background: isSelected ? '#6366f1' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: isSelected ? '#fff' : 'transparent', fontSize: '0.7rem',
                            flexShrink: 0,
                          }}>
                            ✓
                          </span>
                          {opt.label || opt.value}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder="Type your answer..."
                    value={answers[q.id] || ''}
                    onChange={(e) => selectAnswer(q.id, e.target.value)}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 12,
                      border: '2px solid #e2e8f0', fontSize: '0.88rem',
                      outline: 'none', transition: 'border-color 0.15s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                    onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginTop: 16, padding: '10px 16px', background: '#fee2e2', color: '#dc2626', borderRadius: 10, fontSize: '0.82rem' }}>
              {error}
            </div>
          )}

          {/* Submit button */}
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={submitReview}
              disabled={!allAnswered || submitting}
              style={{
                padding: '12px 32px',
                background: allAnswered ? 'linear-gradient(135deg, #6366f1, #818cf8)' : '#e2e8f0',
                color: allAnswered ? '#fff' : '#94a3b8',
                fontSize: '0.9rem', fontWeight: 700, borderRadius: 12,
                border: 'none', cursor: allAnswered ? 'pointer' : 'not-allowed',
                opacity: submitting ? 0.7 : 1,
                transition: 'all 0.18s',
              }}
            >
              {submitting ? '⏳ Checking...' : 'Submit Answers →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Result state — show feedback
  if (phase === 'result' && lastResult) {
    const { correct, total, passed, feedback, masteryUpdate } = lastResult;
    const scorePercent = total > 0 ? Math.round((correct / total) * 100) : 0;

    return (
      <div className={styles.dashCard} style={{ textAlign: 'center', padding: '40px 24px' }}>
        {/* Score circle */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: passed ? 'linear-gradient(135deg, #059669, #34d399)' : 'linear-gradient(135deg, #f59e0b, #fbbf24)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', boxShadow: passed ? '0 4px 20px rgba(5, 150, 105, 0.25)' : '0 4px 20px rgba(245, 158, 11, 0.25)',
        }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
            {correct}/{total}
          </span>
        </div>

        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: passed ? '#059669' : '#d97706', marginBottom: 8 }}>
          {passed ? '🎉 Great job!' : '📚 Keep practicing!'}
        </div>

        <div style={{ fontSize: '0.88rem', color: '#475569', marginBottom: 20, lineHeight: 1.5 }}>
          {feedback}
        </div>

        {/* Mastery update */}
        {masteryUpdate && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 18px', borderRadius: 12,
            background: getMasteryBg(masteryUpdate.newState),
            color: getMasteryColor(masteryUpdate.newState),
            fontSize: '0.82rem', fontWeight: 600, marginBottom: 20,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: getMasteryColor(masteryUpdate.newState) }} />
            {masteryUpdate.skillTitle}: {getMasteryLabel(masteryUpdate.newState)} ({Math.round(masteryUpdate.newScore * 100)}%)
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 8 }}>
          <button
            onClick={nextItem}
            style={{
              padding: '12px 32px',
              background: currentIndex + 1 < reviewItems.length
                ? 'linear-gradient(135deg, #6366f1, #818cf8)'
                : 'linear-gradient(135deg, #059669, #10b981)',
              color: '#fff', fontSize: '0.9rem', fontWeight: 700, borderRadius: 12,
              border: 'none', cursor: 'pointer', transition: 'all 0.18s',
            }}
          >
            {currentIndex + 1 < reviewItems.length ? 'Next Skill →' : '✅ Finish Review'}
          </button>
        </div>
      </div>
    );
  }

  // Complete state — all done!
  if (phase === 'complete') {
    return (
      <div className={styles.dashCard} style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🏆</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1a2137', marginBottom: 8 }}>
          Review Session Complete!
        </div>
        <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: 24, lineHeight: 1.5 }}>
          You reviewed <strong>{reviewItems.length}</strong> skill{reviewItems.length !== 1 ? 's' : ''} today.
          {completedCount > 0 && <> That&apos;s <strong>{completedCount}</strong> total reviews today!</>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          <button
            onClick={loadReviewItems}
            style={{
              padding: '12px 28px', background: 'linear-gradient(135deg, #6366f1, #818cf8)',
              color: '#fff', fontSize: '0.88rem', fontWeight: 700, borderRadius: 12,
              border: 'none', cursor: 'pointer',
            }}
          >
            🔄 Review More
          </button>
          <a
            href="/student/dashboard"
            style={{
              padding: '12px 28px', background: '#f1f5f9',
              color: '#475569', fontSize: '0.88rem', fontWeight: 700, borderRadius: 12,
              textDecoration: 'none', display: 'inline-block',
            }}
          >
            ← Dashboard
          </a>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Helpers ───

function getMasteryColor(state: string): string {
  switch (state) {
    case 'MASTERED': return '#059669';
    case 'DEVELOPING': case 'PRACTICING': return '#3b82f6';
    case 'REVIEW_DUE': return '#f59e0b';
    case 'NEEDS_SUPPORT': return '#ef4444';
    default: return '#94a3b8';
  }
}

function getMasteryBg(state: string): string {
  switch (state) {
    case 'MASTERED': return '#d1fae5';
    case 'DEVELOPING': case 'PRACTICING': return '#dbeafe';
    case 'REVIEW_DUE': return '#fef3c7';
    case 'NEEDS_SUPPORT': return '#fee2e2';
    default: return '#f1f5f9';
  }
}

function getMasteryLabel(state: string): string {
  switch (state) {
    case 'MASTERED': return 'Mastered';
    case 'DEVELOPING': return 'Developing';
    case 'PRACTICING': return 'Practicing';
    case 'REVIEW_DUE': return 'Review Due';
    case 'NEEDS_SUPPORT': return 'Needs Support';
    default: return 'Not Started';
  }
}
