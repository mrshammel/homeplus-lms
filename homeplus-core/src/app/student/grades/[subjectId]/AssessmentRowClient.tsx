'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, CheckCircle, MessageSquare } from 'lucide-react';

export default function AssessmentRowClient({ submission, categoryName }: { submission: any, categoryName: string }) {
  const [expanded, setExpanded] = useState(false);
  const contentId = `assessment-content-${submission.id}`;

  const score = submission.score;
  const maxScore = submission.maxScore || submission.activity.points || 1;
  const percentage = score != null ? Math.round((score / maxScore) * 100) : null;
  
  const hasFeedback = submission.teacherFeedback || submission.aiFeedback;

  return (
    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e8ecf1', overflow: 'hidden', marginBottom: '12px' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls={contentId}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'inherit'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: percentage != null && percentage >= 75 ? '#d1fae5' : '#f1f5f9',
            color: percentage != null && percentage >= 75 ? '#059669' : '#64748b',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a2137' }}>{submission.activity.title}</div>
            <div style={{ fontSize: '0.8rem', color: '#5c6478', marginTop: '4px' }}>
              {categoryName} • {new Date(submission.submittedAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {hasFeedback && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>
              <MessageSquare size={14} />
              Feedback
            </div>
          )}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: percentage != null && percentage >= 75 ? '#059669' : '#1a2137' }}>
              {percentage != null ? `${percentage}%` : 'Pending'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#8f96a3' }}>
              {score != null ? `${score} / ${maxScore}` : '-'}
            </div>
          </div>
          <div style={{ color: '#8f96a3', display: 'flex', alignItems: 'center' }}>
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </button>

      {expanded && (
        <div id={contentId} style={{ padding: '0 20px 20px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ marginTop: '16px' }}>
            {submission.teacherFeedback && (
              <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '10px', marginBottom: '12px' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MessageSquare size={16} /> Teacher Feedback
                </h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#92400e', lineHeight: 1.5 }}>
                  {submission.teacherFeedback}
                </p>
              </div>
            )}
            
            {submission.aiFeedback && (
              <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '10px' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={16} /> AI Feedback
                </h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#0c4a6e', lineHeight: 1.5 }}>
                  {submission.aiFeedback}
                </p>
              </div>
            )}

            {!hasFeedback && (
              <div style={{ fontSize: '0.9rem', color: '#64748b', fontStyle: 'italic', padding: '8px 0' }}>
                No feedback available for this submission yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
