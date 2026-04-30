'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowUp, ArrowDown, RefreshCcw, Save } from 'lucide-react';
import { ActivityType } from '@prisma/client';

interface CategoryWeighting {
  id?: string;
  activityType: ActivityType;
  displayName: string | null;
  description: string | null;
  weightPercent: number;
  displayOrder: number;
}

const DEFAULT_DEFAULTS: CategoryWeighting[] = [
  { activityType: 'QUIZ', displayName: 'Quizzes', description: null, weightPercent: 30, displayOrder: 1 },
  { activityType: 'ASSIGNMENT', displayName: 'Assignments', description: null, weightPercent: 30, displayOrder: 2 },
  { activityType: 'ACTIVITY', displayName: 'Activities', description: null, weightPercent: 25, displayOrder: 3 },
  { activityType: 'REFLECTION', displayName: 'Reflections', description: null, weightPercent: 15, displayOrder: 4 },
];

const COLORS = ['#06b6d4', '#0ea5e9', '#3b82f6', '#8b5cf6']; // Cyan -> Teal -> Blue -> Violet

export default function WeightingEditor({ courseId }: { courseId: string }) {
  const [weightings, setWeightings] = useState<CategoryWeighting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  const fetchWeightings = useCallback(async () => {
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/weightings`);
      if (res.ok) {
        const data = await res.json();
        // Fallback to defaults if none exist (though seed should have populated them)
        if (data.length === 0) {
          setWeightings(DEFAULT_DEFAULTS);
        } else {
          setWeightings(data);
        }
      }
    } catch (e) {
      console.error('Failed to fetch weightings:', e);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchWeightings();
  }, [fetchWeightings]);

  const totalWeight = weightings.reduce((sum, w) => sum + (w.weightPercent || 0), 0);
  const isValid = Math.abs(totalWeight - 100) < 0.01;

  const handleChange = (index: number, field: keyof CategoryWeighting, value: any) => {
    const newWeightings = [...weightings];
    newWeightings[index] = { ...newWeightings[index], [field]: value };
    setWeightings(newWeightings);
    setIsDirty(true);
  };

  const moveRow = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === weightings.length - 1) return;

    const newWeightings = [...weightings];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    const temp = newWeightings[index];
    newWeightings[index] = newWeightings[swapIndex];
    newWeightings[swapIndex] = temp;
    
    // Reassign displayOrder
    newWeightings.forEach((w, i) => { w.displayOrder = i + 1; });
    
    setWeightings(newWeightings);
    setIsDirty(true);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset to the default 30/30/25/15 split? Custom names and descriptions will be lost.')) {
      setWeightings(JSON.parse(JSON.stringify(DEFAULT_DEFAULTS)));
      setIsDirty(true);
    }
  };

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/weightings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weightings }),
      });
      if (res.ok) {
        setSaveMsg('✓ Weightings saved');
        setIsDirty(false);
        setTimeout(() => setSaveMsg(''), 3000);
      } else {
        const err = await res.json();
        setSaveMsg(`⚠️ ${err.error || 'Save failed'}`);
      }
    } catch {
      setSaveMsg('⚠️ Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 20, color: '#64748b' }}>Loading weightings...</div>;

  return (
    <div style={{ background: '#fff', border: '1px solid #e8ecf1', borderRadius: '20px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 6px -1px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1a2137', margin: '0 0 4px', fontFamily: 'var(--font-sora, sans-serif)' }}>
            Grade Category Weightings
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#5c6478', margin: 0 }}>
            Set how each assessment category contributes to the final grade. The total must equal 100%.<br/>
            <span style={{ fontSize: '0.75rem', color: '#8f96a3', marginTop: '4px', display: 'inline-block' }}>
              Categories are fixed by your school's gradebook structure. You can adjust weights, display names, and descriptions, and reorder how they appear to students.
            </span>
          </p>
        </div>
        
        <div 
          role="status" 
          aria-live="polite"
          style={{ 
            padding: '6px 14px', 
            borderRadius: '20px', 
            fontSize: '0.85rem', 
            fontWeight: 700,
            background: isValid ? '#10b981' : '#f59e0b',
            color: isValid ? '#fff' : '#78350f',
            whiteSpace: 'nowrap'
          }}
        >
          {isValid ? `Total: 100% ✓` : `Total: ${totalWeight}% — must equal 100%`}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
        {weightings.map((w, i) => (
          <div key={w.activityType} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: i % 2 === 0 ? '#f8fafc' : '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
            
            {/* Color Swatch & Order Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: COLORS[i % COLORS.length] }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <button onClick={() => moveRow(i, 'up')} disabled={i === 0} aria-label={`Move ${w.displayName || w.activityType} up`} style={{ background: 'none', border: 'none', cursor: i === 0 ? 'not-allowed' : 'pointer', color: i === 0 ? '#cbd5e1' : '#64748b', padding: 0 }}>
                  <ArrowUp size={16} />
                </button>
                <button onClick={() => moveRow(i, 'down')} disabled={i === weightings.length - 1} aria-label={`Move ${w.displayName || w.activityType} down`} style={{ background: 'none', border: 'none', cursor: i === weightings.length - 1 ? 'not-allowed' : 'pointer', color: i === weightings.length - 1 ? '#cbd5e1' : '#64748b', padding: 0 }}>
                  <ArrowDown size={16} />
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Display Name</label>
                  <input 
                    type="text" 
                    value={w.displayName || ''} 
                    onChange={(e) => handleChange(i, 'displayName', e.target.value)}
                    placeholder={w.activityType}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <div style={{ width: '100px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Weight (%)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    value={w.weightPercent} 
                    onChange={(e) => handleChange(i, 'weightPercent', Number(e.target.value))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 700 }}
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Description (optional)</label>
                <textarea 
                  value={w.description || ''} 
                  onChange={(e) => handleChange(i, 'description', e.target.value)}
                  placeholder="Shown to students on the grade detail page..."
                  rows={2}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e8ecf1' }}>
        <button 
          onClick={handleReset}
          style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCcw size={14} /> Reset to defaults
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isDirty && <span style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 600 }}>Unsaved changes</span>}
          {saveMsg && <span aria-live="polite" style={{ fontSize: '0.85rem', color: saveMsg.includes('✓') ? '#10b981' : '#ef4444', fontWeight: 600 }}>{saveMsg}</span>}
          
          {isDirty && (
            <button 
              onClick={() => { fetchWeightings(); setIsDirty(false); }}
              style={{ padding: '8px 16px', borderRadius: '8px', background: '#f1f5f9', color: '#475569', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
            >
              Discard
            </button>
          )}

          <button 
            onClick={handleSave} 
            disabled={!isValid || saving || !isDirty}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 24px', borderRadius: '8px', 
              background: (!isValid || !isDirty) ? '#cbd5e1' : 'var(--subject-gradient, linear-gradient(90deg, #6366f1, #8b5cf6))', 
              color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.9rem',
              cursor: (!isValid || saving || !isDirty) ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
