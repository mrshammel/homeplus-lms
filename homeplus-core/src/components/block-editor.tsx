'use client';

// ============================================
// Block Editor Components - Home Plus LMS
// ============================================
// Visual form editors for each lesson block type.
// Replaces raw JSON editing in the lesson builder.

import { useState, type CSSProperties } from 'react';
import type { BlockType } from '@/lib/lesson-types';

// ─── Shared Styles ───

const labelStyle: CSSProperties = {
  display: 'block', fontSize: '0.78rem', fontWeight: 600,
  color: '#475569', marginBottom: 4,
};

const inputStyle: CSSProperties = {
  width: '100%', padding: '8px 12px', fontSize: '0.86rem',
  border: '1.5px solid #e2e8f0', borderRadius: 8,
  outline: 'none', boxSizing: 'border-box',
};

const textareaStyle: CSSProperties = {
  ...inputStyle, fontFamily: 'inherit', resize: 'vertical', minHeight: 80,
};

const smallBtn: CSSProperties = {
  padding: '5px 12px', fontSize: '0.76rem', fontWeight: 600,
  border: 'none', borderRadius: 6, cursor: 'pointer',
};

const addBtn: CSSProperties = {
  ...smallBtn, color: '#2563eb', background: '#eff6ff',
};

const removeBtn: CSSProperties = {
  ...smallBtn, color: '#dc2626', background: '#fef2f2',
};

const fieldGroup: CSSProperties = {
  marginBottom: 10,
};

// ─── Main Editor Component ───

interface BlockEditorProps {
  blockType: BlockType;
  content: any;
  onChange: (content: any) => void;
}

export function BlockEditor({ blockType, content, onChange }: BlockEditorProps) {
  switch (blockType) {
    case 'TEXT':
      return <TextEditor content={content} onChange={onChange} />;
    case 'VIDEO':
      return <VideoEditor content={content} onChange={onChange} />;
    case 'IMAGE':
      return <ImageEditor content={content} onChange={onChange} />;
    case 'VOCABULARY':
      return <VocabularyEditor content={content} onChange={onChange} />;
    case 'MULTIPLE_CHOICE':
    case 'MICRO_CHECK':
      return <MultipleChoiceEditor content={content} onChange={onChange} />;
    case 'FILL_IN_BLANK':
      return <FillInBlankEditor content={content} onChange={onChange} />;
    case 'MATCHING':
      return <MatchingEditor content={content} onChange={onChange} />;
    case 'CONSTRUCTED_RESPONSE':
      return <ConstructedResponseEditor content={content} onChange={onChange} />;
    case 'WORKED_EXAMPLE':
      return <WorkedExampleEditor content={content} onChange={onChange} />;
    case 'AI_SUMMARY':
      return <AISummaryEditor content={content} onChange={onChange} />;
    case 'DRAWING':
    case 'PHOTO_UPLOAD':
    case 'TAKE_PHOTO':
    case 'VIDEO_UPLOAD':
    case 'TAKE_VIDEO':
    case 'FILE_UPLOAD':
      return <UploadEditor content={content} onChange={onChange} />;
    default:
      return <RawJSONEditor content={content} onChange={onChange} />;
  }
}

// ─── Block Type Editors ───

function TextEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  const val = content?.html || '';
  return (
    <div style={fieldGroup}>
      <label style={labelStyle}>Content (HTML)</label>
      <textarea
        value={val}
        onChange={(e) => onChange({ ...content, html: e.target.value })}
        rows={6}
        placeholder="Enter content text or HTML..."
        style={textareaStyle}
      />
      <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>
        Supports HTML tags: &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;h3&gt;, &lt;h4&gt;
      </p>
    </div>
  );
}

function VideoEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  return (
    <>
      <div style={fieldGroup}>
        <label style={labelStyle}>Video URL</label>
        <input
          type="text"
          value={content?.url || ''}
          onChange={(e) => onChange({ ...content, url: e.target.value })}
          placeholder="https://www.youtube.com/embed/..."
          style={inputStyle}
        />
      </div>
      <div style={fieldGroup}>
        <label style={labelStyle}>Title</label>
        <input
          type="text"
          value={content?.title || ''}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          placeholder="Video title"
          style={inputStyle}
        />
      </div>
      <div style={fieldGroup}>
        <label style={labelStyle}>Transcript <span style={{ color: '#94a3b8' }}>(optional)</span></label>
        <textarea
          value={content?.transcript || ''}
          onChange={(e) => onChange({ ...content, transcript: e.target.value })}
          rows={3}
          placeholder="Video transcript for accessibility..."
          style={textareaStyle}
        />
      </div>
    </>
  );
}

function ImageEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  return (
    <>
      <div style={fieldGroup}>
        <label style={labelStyle}>Image URL</label>
        <input
          type="text"
          value={content?.url || ''}
          onChange={(e) => onChange({ ...content, url: e.target.value })}
          placeholder="https://..."
          style={inputStyle}
        />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ ...fieldGroup, flex: 1 }}>
          <label style={labelStyle}>Alt Text</label>
          <input
            type="text"
            value={content?.alt || ''}
            onChange={(e) => onChange({ ...content, alt: e.target.value })}
            placeholder="Describe the image"
            style={inputStyle}
          />
        </div>
        <div style={{ ...fieldGroup, flex: 1 }}>
          <label style={labelStyle}>Caption <span style={{ color: '#94a3b8' }}>(optional)</span></label>
          <input
            type="text"
            value={content?.caption || ''}
            onChange={(e) => onChange({ ...content, caption: e.target.value })}
            placeholder="Image caption"
            style={inputStyle}
          />
        </div>
      </div>
    </>
  );
}

function VocabularyEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  const terms = content?.terms || [{ term: '', definition: '', example: '' }];

  const updateTerm = (index: number, field: string, value: string) => {
    const updated = [...terms];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...content, terms: updated });
  };

  const addTerm = () => {
    onChange({ ...content, terms: [...terms, { term: '', definition: '', example: '' }] });
  };

  const removeTerm = (index: number) => {
    onChange({ ...content, terms: terms.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div>
      <label style={{ ...labelStyle, marginBottom: 8 }}>Vocabulary Terms ({terms.length})</label>
      {terms.map((t: any, i: number) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 120px' }}>
            {i === 0 && <label style={{ ...labelStyle, fontSize: '0.7rem' }}>Term</label>}
            <input
              type="text"
              value={t.term}
              onChange={(e) => updateTerm(i, 'term', e.target.value)}
              placeholder="Term"
              style={inputStyle}
            />
          </div>
          <div style={{ flex: '2 1 200px' }}>
            {i === 0 && <label style={{ ...labelStyle, fontSize: '0.7rem' }}>Definition</label>}
            <input
              type="text"
              value={t.definition}
              onChange={(e) => updateTerm(i, 'definition', e.target.value)}
              placeholder="Definition"
              style={inputStyle}
            />
          </div>
          <div style={{ flex: '1 1 150px' }}>
            {i === 0 && <label style={{ ...labelStyle, fontSize: '0.7rem' }}>Example</label>}
            <input
              type="text"
              value={t.example || ''}
              onChange={(e) => updateTerm(i, 'example', e.target.value)}
              placeholder="Example (optional)"
              style={inputStyle}
            />
          </div>
          <button onClick={() => removeTerm(i)} style={{ ...removeBtn, marginTop: i === 0 ? 20 : 0 }}>✕</button>
        </div>
      ))}
      <button onClick={addTerm} style={addBtn}>+ Add Term</button>
    </div>
  );
}

function MultipleChoiceEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  const options = content?.options || [{ label: '', value: 'a' }, { label: '', value: 'b' }];

  const updateOption = (index: number, field: string, value: any) => {
    const updated = [...options];
    if (field === 'correct') {
      // Only one correct answer
      updated.forEach((o: any, i: number) => { o.correct = i === index; });
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    onChange({ ...content, options: updated });
  };

  const addOption = () => {
    const letter = String.fromCharCode(97 + options.length); // a, b, c, d...
    onChange({ ...content, options: [...options, { label: '', value: letter }] });
  };

  const removeOption = (index: number) => {
    onChange({ ...content, options: options.filter((_: any, i: number) => i !== index) });
  };

  return (
    <>
      <div style={fieldGroup}>
        <label style={labelStyle}>Question</label>
        <textarea
          value={content?.question || ''}
          onChange={(e) => onChange({ ...content, question: e.target.value })}
          rows={2}
          placeholder="Enter the question..."
          style={textareaStyle}
        />
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>Answer Options</label>
        {options.map((opt: any, i: number) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
            <input
              type="radio"
              name="correct-option"
              checked={opt.correct === true}
              onChange={() => updateOption(i, 'correct', true)}
              title="Mark as correct answer"
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', width: 20 }}>
              {opt.value?.toUpperCase?.() || String.fromCharCode(65 + i)}
            </span>
            <input
              type="text"
              value={opt.label}
              onChange={(e) => updateOption(i, 'label', e.target.value)}
              placeholder={`Option ${String.fromCharCode(65 + i)}`}
              style={{ ...inputStyle, flex: 1 }}
            />
            {opt.correct && (
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#059669', background: '#f0fdf4', padding: '2px 8px', borderRadius: 4 }}>✓ Correct</span>
            )}
            {options.length > 2 && (
              <button onClick={() => removeOption(i)} style={removeBtn}>✕</button>
            )}
          </div>
        ))}
        <button onClick={addOption} style={{ ...addBtn, marginTop: 4 }}>+ Add Option</button>
      </div>
      <div style={fieldGroup}>
        <label style={labelStyle}>Explanation <span style={{ color: '#94a3b8' }}>(shown after answer)</span></label>
        <textarea
          value={content?.explanation || ''}
          onChange={(e) => onChange({ ...content, explanation: e.target.value })}
          rows={2}
          placeholder="Why is this the correct answer?"
          style={textareaStyle}
        />
      </div>
    </>
  );
}

function FillInBlankEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  const blanks = content?.blanks || [{ id: '1', correctAnswer: '', hint: '' }];

  const updateBlank = (index: number, field: string, value: string) => {
    const updated = [...blanks];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...content, blanks: updated });
  };

  const addBlank = () => {
    onChange({
      ...content,
      blanks: [...blanks, { id: String(blanks.length + 1), correctAnswer: '', hint: '' }],
    });
  };

  const removeBlank = (index: number) => {
    onChange({ ...content, blanks: blanks.filter((_: any, i: number) => i !== index) });
  };

  return (
    <>
      <div style={fieldGroup}>
        <label style={labelStyle}>
          Prompt <span style={{ color: '#94a3b8' }}>(use [BLANK] to mark where blanks go)</span>
        </label>
        <textarea
          value={content?.prompt || ''}
          onChange={(e) => onChange({ ...content, prompt: e.target.value })}
          rows={3}
          placeholder="The process of [BLANK] converts sunlight into [BLANK]."
          style={textareaStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>Blanks ({blanks.length})</label>
        {blanks.map((b: any, i: number) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2563eb', width: 28 }}>#{b.id}</span>
            <input
              type="text"
              value={b.correctAnswer}
              onChange={(e) => updateBlank(i, 'correctAnswer', e.target.value)}
              placeholder="Correct answer"
              style={{ ...inputStyle, flex: 1 }}
            />
            <input
              type="text"
              value={b.hint || ''}
              onChange={(e) => updateBlank(i, 'hint', e.target.value)}
              placeholder="Hint (optional)"
              style={{ ...inputStyle, flex: 1 }}
            />
            {blanks.length > 1 && (
              <button onClick={() => removeBlank(i)} style={removeBtn}>✕</button>
            )}
          </div>
        ))}
        <button onClick={addBlank} style={addBtn}>+ Add Blank</button>
      </div>
    </>
  );
}

function MatchingEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  const pairs = content?.pairs || [{ left: '', right: '' }];

  const updatePair = (index: number, side: 'left' | 'right', value: string) => {
    const updated = [...pairs];
    updated[index] = { ...updated[index], [side]: value };
    onChange({ ...content, pairs: updated });
  };

  const addPair = () => {
    onChange({ ...content, pairs: [...pairs, { left: '', right: '' }] });
  };

  const removePair = (index: number) => {
    onChange({ ...content, pairs: pairs.filter((_: any, i: number) => i !== index) });
  };

  return (
    <>
      <div style={fieldGroup}>
        <label style={labelStyle}>Instruction</label>
        <input
          type="text"
          value={content?.instruction || ''}
          onChange={(e) => onChange({ ...content, instruction: e.target.value })}
          placeholder="Match the terms with their definitions"
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>Pairs ({pairs.length})</label>
        {pairs.map((p: any, i: number) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
            <input
              type="text"
              value={p.left}
              onChange={(e) => updatePair(i, 'left', e.target.value)}
              placeholder="Term"
              style={{ ...inputStyle, flex: 1 }}
            />
            <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>↔</span>
            <input
              type="text"
              value={p.right}
              onChange={(e) => updatePair(i, 'right', e.target.value)}
              placeholder="Match"
              style={{ ...inputStyle, flex: 1 }}
            />
            {pairs.length > 1 && (
              <button onClick={() => removePair(i)} style={removeBtn}>✕</button>
            )}
          </div>
        ))}
        <button onClick={addPair} style={addBtn}>+ Add Pair</button>
      </div>
    </>
  );
}

function ConstructedResponseEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  return (
    <>
      <div style={fieldGroup}>
        <label style={labelStyle}>Prompt</label>
        <textarea
          value={content?.prompt || ''}
          onChange={(e) => onChange({ ...content, prompt: e.target.value })}
          rows={3}
          placeholder="Ask students to explain, describe, or analyze..."
          style={textareaStyle}
        />
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ ...fieldGroup, flex: '0 0 120px' }}>
          <label style={labelStyle}>Min Length</label>
          <input
            type="number"
            value={content?.minLength || ''}
            onChange={(e) => onChange({ ...content, minLength: Number(e.target.value) || undefined })}
            placeholder="50"
            style={inputStyle}
          />
        </div>
        <div style={{ ...fieldGroup, flex: 1 }}>
          <label style={labelStyle}>Rubric Hint <span style={{ color: '#94a3b8' }}>(for teacher review)</span></label>
          <input
            type="text"
            value={content?.rubricHint || ''}
            onChange={(e) => onChange({ ...content, rubricHint: e.target.value })}
            placeholder="Look for: key terms, specific examples, logical reasoning..."
            style={inputStyle}
          />
        </div>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#475569', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={content?.teacherReviewRequired ?? true}
          onChange={(e) => onChange({ ...content, teacherReviewRequired: e.target.checked })}
        />
        Requires teacher review
      </label>
    </>
  );
}

function WorkedExampleEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  const steps = content?.steps || [{ instruction: '', detail: '' }];

  const updateStep = (index: number, field: string, value: string) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...content, steps: updated });
  };

  const addStep = () => {
    onChange({ ...content, steps: [...steps, { instruction: '', detail: '' }] });
  };

  const removeStep = (index: number) => {
    onChange({ ...content, steps: steps.filter((_: any, i: number) => i !== index) });
  };

  return (
    <>
      <div style={fieldGroup}>
        <label style={labelStyle}>Example Title</label>
        <input
          type="text"
          value={content?.title || ''}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          placeholder="e.g. Solving for X"
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>Steps ({steps.length})</label>
        {steps.map((s: any, i: number) => (
          <div key={i} style={{ marginBottom: 10, padding: '10px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563eb' }}>Step {i + 1}</span>
              {steps.length > 1 && (
                <button onClick={() => removeStep(i)} style={removeBtn}>✕</button>
              )}
            </div>
            <input
              type="text"
              value={s.instruction}
              onChange={(e) => updateStep(i, 'instruction', e.target.value)}
              placeholder="Instruction for this step"
              style={{ ...inputStyle, marginBottom: 6 }}
            />
            <input
              type="text"
              value={s.detail || ''}
              onChange={(e) => updateStep(i, 'detail', e.target.value)}
              placeholder="Detail or example (optional)"
              style={inputStyle}
            />
          </div>
        ))}
        <button onClick={addStep} style={addBtn}>+ Add Step</button>
      </div>
    </>
  );
}

function AISummaryEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  return (
    <div style={fieldGroup}>
      <label style={labelStyle}>Summary Text</label>
      <textarea
        value={content?.summary || ''}
        onChange={(e) => onChange({ ...content, summary: e.target.value })}
        rows={5}
        placeholder="Key takeaways from this section..."
        style={textareaStyle}
      />
    </div>
  );
}

function UploadEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  return (
    <div style={fieldGroup}>
      <label style={labelStyle}>Instruction for Students</label>
      <textarea
        value={content?.instruction || ''}
        onChange={(e) => onChange({ ...content, instruction: e.target.value })}
        rows={2}
        placeholder="Upload a photo of your work..."
        style={textareaStyle}
      />
    </div>
  );
}

function RawJSONEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  const [text, setText] = useState(JSON.stringify(content, null, 2));
  const [error, setError] = useState('');

  const handleBlur = () => {
    try {
      onChange(JSON.parse(text));
      setError('');
    } catch {
      setError('Invalid JSON');
    }
  };

  return (
    <div style={fieldGroup}>
      <label style={labelStyle}>Content (JSON)</label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        rows={8}
        style={{ ...textareaStyle, fontFamily: 'monospace', fontSize: '0.78rem' }}
      />
      {error && <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: 4 }}>⚠️ {error}</p>}
    </div>
  );
}
