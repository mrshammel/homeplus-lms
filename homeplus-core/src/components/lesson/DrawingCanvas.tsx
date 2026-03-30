'use client';

// ============================================
// DrawingCanvas — Home Plus Drawing Canvas
// ============================================
// Full HTML5 Canvas drawing tool with:
//  - Freehand pen (Catmull-Rom smoothing)
//  - Eraser (stroke-based, not pixel)
//  - Highlighter (semi-transparent)
//  - Arrow tool (directed line with arrowhead)
//  - Text label tool
//  - Configurable overlays (grids, axes, etc.)
//  - Undo/Redo (50 levels)
//  - Session persistence (sessionStorage)
//  - PNG submission via Submission API

import { useState, useRef, useCallback, useEffect } from 'react';
import styles from './drawing-canvas.module.css';
import type {
  DrawingBlockContent,
  DrawingColour,
  StrokeWidthOption,
} from '@/lib/lesson-types';
import {
  type StrokeObject,
  type Point,
  type ToolType,
  type ShapeType,
  TOOL_DEFS,
  SHAPE_OPTIONS,
  resolveColor,
  resolveStrokeWidth,
  renderStroke,
  strokeIntersectsPath,
  snapToAngle,
  nextStrokeId,
} from './canvas-tools';
import { renderOverlay } from './canvas-overlays';

// ─── Defaults ───

const DEFAULT_COLORS: DrawingColour[] = ['black', 'blue', 'red', 'green', 'orange', 'purple', 'grey'];
const DEFAULT_WIDTHS: StrokeWidthOption[] = ['thin', 'medium', 'thick'];
const MAX_UNDO = 50;

// ─── Component Props ───

interface DrawingCanvasProps {
  content: DrawingBlockContent;
  lessonId: string;
  blockId: string;
  onAnswer?: (value: any) => void;
  readOnly?: boolean;
}

export default function DrawingCanvas({ content, lessonId, blockId, onAnswer, readOnly }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Drawing state (stroke-based, not pixel buffer)
  const [strokes, setStrokes] = useState<StrokeObject[]>([]);
  const [redoStack, setRedoStack] = useState<StrokeObject[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentStrokeRef = useRef<Point[]>([]);
  const activeEraserPathRef = useRef<Point[]>([]);

  // Tool state
  const [activeTool, setActiveTool] = useState<ToolType>('pen');
  const [activeColor, setActiveColor] = useState<string>(resolveColor('black'));
  const [activeWidth, setActiveWidth] = useState<number>(resolveStrokeWidth('medium'));
  const [activeWidthName, setActiveWidthName] = useState<StrokeWidthOption>('medium');

  // Tier 2: Shape sub-menu & shift-snap
  const [activeShapeType, setActiveShapeType] = useState<ShapeType>('rectangle');
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [shapeFilled, setShapeFilled] = useState(false);
  const shiftHeldRef = useRef(false);

  // Text label state
  const [textInputPos, setTextInputPos] = useState<Point | null>(null);
  const [textInputValue, setTextInputValue] = useState('');
  const textInputRef = useRef<HTMLInputElement>(null);

  // UI state
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Canvas dimensions
  const canvasHeight = content.canvasHeight || 400;
  const [canvasWidth, setCanvasWidth] = useState(600);

  // Config-driven tools
  const tools = content.tools;
  const colors = (tools?.colours || DEFAULT_COLORS).map(resolveColor);
  const widths = tools?.strokeWidths || DEFAULT_WIDTHS;
  const showHighlighter = tools?.highlighter !== false;
  const showArrow = tools?.arrow !== false;
  const showTextLabel = tools?.textLabel !== false;
  const showRuler = tools?.ruler === true;
  const showCircle = tools?.circle === true;
  const showShapes = tools?.shapes === true;

  // Prompt text (support legacy `instruction` field)
  const promptText = content.prompt || content.instruction || '';

  // ─── Canvas resize handler ───
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setCanvasWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // ─── Session persistence ───
  const storageKey = `hpln-canvas-${blockId}`;

  useEffect(() => {
    const saved = sessionStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setStrokes(parsed);
      } catch { /* ignore corrupt data */ }
    }
  }, [storageKey]);

  useEffect(() => {
    if (strokes.length > 0) {
      sessionStorage.setItem(storageKey, JSON.stringify(strokes));
    }
  }, [strokes, storageKey]);

  // ─── Full canvas re-render ───
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Background overlay
    renderOverlay(ctx, content.overlay, content.overlayConfig, canvasWidth, canvasHeight, dpr);

    // 2. Committed strokes
    for (const stroke of strokes) {
      renderStroke(ctx, stroke, dpr);
    }

    // 3. Current in-progress stroke preview
    if (isDrawing && currentStrokeRef.current.length > 1) {
      const pts = currentStrokeRef.current;
      const start = pts[0];
      const end = pts[pts.length - 1];

      if (activeTool === 'ruler') {
        // Ruler preview: straight line from start to end (with optional snap)
        const snapped = snapToAngle(start, end, shiftHeldRef.current);
        const previewStroke: StrokeObject = {
          id: 'preview', tool: 'ruler', color: activeColor,
          strokeWidth: activeWidth, opacity: 1,
          points: [start, snapped],
        };
        renderStroke(ctx, previewStroke, dpr);
      } else if (activeTool === 'circle') {
        // Circle preview: center = start, radius = distance to current point
        const r = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
        const previewStroke: StrokeObject = {
          id: 'preview', tool: 'circle', color: activeColor,
          strokeWidth: activeWidth, opacity: 1,
          points: [start], radius: r, filled: shapeFilled,
        };
        renderStroke(ctx, previewStroke, dpr);
      } else if (activeTool === 'shape') {
        // Shape preview: bounding box from start to current
        const w = end.x - start.x;
        const h = end.y - start.y;
        const previewStroke: StrokeObject = {
          id: 'preview', tool: 'shape', color: activeColor,
          strokeWidth: activeWidth, opacity: 1,
          points: [start, end], shapeType: activeShapeType,
          shapeWidth: w, shapeHeight: h, filled: shapeFilled,
        };
        renderStroke(ctx, previewStroke, dpr);
      } else {
        // Freehand tools
        const previewStroke: StrokeObject = {
          id: 'preview',
          tool: activeTool === 'eraser' ? 'pen' : activeTool,
          color: activeColor,
          strokeWidth: activeWidth,
          opacity: activeTool === 'highlighter' ? 0.35 : 1,
          points: pts,
        };

        if (activeTool === 'arrow') {
          previewStroke.tool = 'arrow';
        }

        if (activeTool !== 'eraser') {
          renderStroke(ctx, previewStroke, dpr);
        }
      }
    }
  }, [strokes, canvasWidth, canvasHeight, content.overlay, content.overlayConfig, isDrawing, activeTool, activeColor, activeWidth, activeShapeType, shapeFilled]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // ─── Pointer position helper ───
  const getPointerPos = useCallback((e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure,
    };
  }, []);

  // ─── Pointer handlers ───
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (submitted || readOnly) return;
    e.preventDefault();

    const pos = getPointerPos(e);

    // Text label tool — place input
    if (activeTool === 'text') {
      setTextInputPos(pos);
      setTextInputValue('');
      setTimeout(() => textInputRef.current?.focus(), 50);
      return;
    }

    setIsDrawing(true);
    currentStrokeRef.current = [pos];
    activeEraserPathRef.current = activeTool === 'eraser' ? [pos] : [];

    // Capture pointer for smooth tracking
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
  }, [submitted, readOnly, activeTool, getPointerPos]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || submitted || readOnly) return;
    e.preventDefault();

    const pos = getPointerPos(e);
    currentStrokeRef.current.push(pos);

    if (activeTool === 'eraser') {
      activeEraserPathRef.current.push(pos);
    }

    // Trigger re-render for preview
    redrawCanvas();
  }, [isDrawing, submitted, readOnly, activeTool, getPointerPos, redrawCanvas]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || submitted || readOnly) return;
    e.preventDefault();
    setIsDrawing(false);

    const points = [...currentStrokeRef.current];
    currentStrokeRef.current = [];

    if (points.length < 2) return;

    if (activeTool === 'eraser') {
      // Remove strokes that intersect the eraser path
      const eraserPath = [...activeEraserPathRef.current];
      activeEraserPathRef.current = [];
      setStrokes(prev => {
        const remaining = prev.filter(s => !strokeIntersectsPath(s, eraserPath, 12));
        if (remaining.length < prev.length) {
          setRedoStack([]); // clear redo on new action
        }
        return remaining;
      });
    } else if (activeTool === 'ruler') {
      // Ruler: straight line from first to last point
      const start = points[0];
      const snapped = snapToAngle(start, points[points.length - 1], shiftHeldRef.current);
      const newStroke: StrokeObject = {
        id: nextStrokeId(), tool: 'ruler', color: activeColor,
        strokeWidth: activeWidth, opacity: 1,
        points: [start, snapped],
      };
      setStrokes(prev => [...prev, newStroke]);
      setRedoStack([]);
    } else if (activeTool === 'circle') {
      // Circle: center at first point, radius = distance
      const start = points[0];
      const end = points[points.length - 1];
      const r = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
      if (r > 3) {
        const newStroke: StrokeObject = {
          id: nextStrokeId(), tool: 'circle', color: activeColor,
          strokeWidth: activeWidth, opacity: 1,
          points: [start], radius: r, filled: shapeFilled,
        };
        setStrokes(prev => [...prev, newStroke]);
        setRedoStack([]);
      }
    } else if (activeTool === 'shape') {
      // Shape: bounding box from first to last point
      const start = points[0];
      const end = points[points.length - 1];
      const w = end.x - start.x;
      const h = end.y - start.y;
      if (Math.abs(w) > 5 && Math.abs(h) > 5) {
        const newStroke: StrokeObject = {
          id: nextStrokeId(), tool: 'shape', color: activeColor,
          strokeWidth: activeWidth, opacity: 1,
          points: [start, end], shapeType: activeShapeType,
          shapeWidth: w, shapeHeight: h, filled: shapeFilled,
        };
        setStrokes(prev => [...prev, newStroke]);
        setRedoStack([]);
      }
    } else {
      // Commit new stroke (pen, highlighter, arrow)
      const newStroke: StrokeObject = {
        id: nextStrokeId(),
        tool: activeTool,
        color: activeColor,
        strokeWidth: activeWidth,
        opacity: activeTool === 'highlighter' ? 0.35 : 1,
        points,
      };

      setStrokes(prev => {
        const next = [...prev, newStroke];
        return next.length > MAX_UNDO * 3 ? next.slice(-MAX_UNDO * 3) : next;
      });
      setRedoStack([]);
    }
  }, [isDrawing, submitted, readOnly, activeTool, activeColor, activeWidth, activeShapeType, shapeFilled]);

  // ─── Text label commit ───
  const commitTextLabel = useCallback(() => {
    if (!textInputValue.trim() || !textInputPos) {
      setTextInputPos(null);
      return;
    }

    const textStroke: StrokeObject = {
      id: nextStrokeId(),
      tool: 'text',
      color: activeColor,
      strokeWidth: 0,
      opacity: 1,
      points: [],
      text: textInputValue.trim(),
      textPosition: textInputPos,
    };

    setStrokes(prev => [...prev, textStroke]);
    setRedoStack([]);
    setTextInputPos(null);
    setTextInputValue('');
  }, [textInputValue, textInputPos, activeColor]);

  // ─── Undo / Redo ───
  const handleUndo = useCallback(() => {
    if (submitted || strokes.length === 0) return;
    const last = strokes[strokes.length - 1];
    setStrokes(prev => prev.slice(0, -1));
    setRedoStack(prev => [last, ...prev].slice(0, MAX_UNDO));
  }, [submitted, strokes]);

  const handleRedo = useCallback(() => {
    if (submitted || redoStack.length === 0) return;
    const next = redoStack[0];
    setRedoStack(prev => prev.slice(1));
    setStrokes(prev => [...prev, next]);
  }, [submitted, redoStack]);

  // ─── Clear ───
  const handleClear = useCallback(() => {
    setStrokes([]);
    setRedoStack([]);
    setShowClearConfirm(false);
    sessionStorage.removeItem(storageKey);
  }, [storageKey]);

  // ─── Keyboard shortcuts + Shift tracking ───
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (submitted) return;
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (mod && (e.key === 'Z' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };
    const shiftDown = (e: KeyboardEvent) => { if (e.key === 'Shift') shiftHeldRef.current = true; };
    const shiftUp = (e: KeyboardEvent) => { if (e.key === 'Shift') shiftHeldRef.current = false; };
    window.addEventListener('keydown', handler);
    window.addEventListener('keydown', shiftDown);
    window.addEventListener('keyup', shiftUp);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('keydown', shiftDown);
      window.removeEventListener('keyup', shiftUp);
    };
  }, [submitted, handleUndo, handleRedo]);

  // ─── Submit ───
  const handleSubmit = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || submitted || submitting) return;

    setSubmitting(true);

    try {
      const dataUrl = canvas.toDataURL('image/png');

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId: blockId,
          submissionType: 'IMAGE_ARTIFACT',
          fileUrl: dataUrl,
          fileName: `drawing-${blockId}.png`,
          response: {
            type: 'DRAWING',
            strokeCount: strokes.length,
            overlay: content.overlay || 'none',
            toolsUsed: [...new Set(strokes.map(s => s.tool))],
          },
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        sessionStorage.removeItem(storageKey);
        onAnswer?.({ submitted: true, strokeCount: strokes.length });
      }
    } catch (err) {
      console.error('[DrawingCanvas] Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  }, [submitted, submitting, blockId, strokes, content.overlay, storageKey, onAnswer]);

  // ─── Photo upload fallback ───
  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      try {
        const res = await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activityId: blockId,
            submissionType: 'IMAGE_ARTIFACT',
            fileUrl: dataUrl,
            fileName: file.name,
            response: { type: 'PHOTO_UPLOAD', source: 'drawing_alternative' },
          }),
        });

        if (res.ok) {
          setSubmitted(true);
          onAnswer?.({ submitted: true, method: 'photo' });
        }
      } catch (err) {
        console.error('[DrawingCanvas] Photo upload error:', err);
      }
    };
    reader.readAsDataURL(file);
  }, [blockId, onAnswer]);

  // ─── Derived state ───
  const minMarks = content.minExpectedMarks ?? 3;
  const canSubmit = strokes.length >= minMarks && !submitted && !submitting;

  // ─── Render ───
  return (
    <div className={styles.canvasContainer} ref={containerRef}>
      {/* Prompt */}
      {promptText && (
        <div className={styles.prompt}>🎨 {promptText}</div>
      )}

      {/* Toolbar */}
      {!submitted && !readOnly && (
        <div className={styles.toolbar}>
          {/* Tools */}
          <div className={styles.toolGroup}>
            <button
              className={`${styles.toolBtn} ${activeTool === 'pen' ? styles.toolBtnActive : ''}`}
              onClick={() => setActiveTool('pen')}
              title="Pen"
              aria-label="Pen tool"
            >
              {TOOL_DEFS.pen.icon}
            </button>
            <button
              className={`${styles.toolBtn} ${activeTool === 'eraser' ? styles.toolBtnActive : ''}`}
              onClick={() => setActiveTool('eraser')}
              title="Eraser"
              aria-label="Eraser tool"
            >
              {TOOL_DEFS.eraser.icon}
            </button>
            {showHighlighter && (
              <button
                className={`${styles.toolBtn} ${activeTool === 'highlighter' ? styles.toolBtnActive : ''}`}
                onClick={() => setActiveTool('highlighter')}
                title="Highlighter"
                aria-label="Highlighter tool"
              >
                {TOOL_DEFS.highlighter.icon}
              </button>
            )}
            {showArrow && (
              <button
                className={`${styles.toolBtn} ${activeTool === 'arrow' ? styles.toolBtnActive : ''}`}
                onClick={() => setActiveTool('arrow')}
                title="Arrow"
                aria-label="Arrow tool"
              >
                {TOOL_DEFS.arrow.icon}
              </button>
            )}
            {showTextLabel && (
              <button
                className={`${styles.toolBtn} ${activeTool === 'text' ? styles.toolBtnActive : ''}`}
                onClick={() => setActiveTool('text')}
                title="Text Label"
                aria-label="Text label tool"
              >
                {TOOL_DEFS.text.icon}
              </button>
            )}
            {showRuler && (
              <button
                className={`${styles.toolBtn} ${activeTool === 'ruler' ? styles.toolBtnActive : ''}`}
                onClick={() => setActiveTool('ruler')}
                title="Straight Line (hold Shift to snap)"
                aria-label="Straight line tool"
              >
                {TOOL_DEFS.ruler.icon}
              </button>
            )}
            {showCircle && (
              <button
                className={`${styles.toolBtn} ${activeTool === 'circle' ? styles.toolBtnActive : ''}`}
                onClick={() => setActiveTool('circle')}
                title="Circle (drag from center)"
                aria-label="Circle tool"
              >
                {TOOL_DEFS.circle.icon}
              </button>
            )}
            {showShapes && (
              <div style={{ position: 'relative' }}>
                <button
                  className={`${styles.toolBtn} ${activeTool === 'shape' ? styles.toolBtnActive : ''}`}
                  onClick={() => { setActiveTool('shape'); setShowShapeMenu(prev => !prev); }}
                  title="Shapes"
                  aria-label="Shape tool"
                >
                  {TOOL_DEFS.shape.icon}
                </button>
                {showShapeMenu && activeTool === 'shape' && (
                  <div className={styles.shapeMenu}>
                    {SHAPE_OPTIONS.map(s => (
                      <button
                        key={s.type}
                        className={`${styles.toolBtn} ${activeShapeType === s.type ? styles.toolBtnActive : ''}`}
                        onClick={() => { setActiveShapeType(s.type); setShowShapeMenu(false); }}
                        title={s.label}
                        aria-label={s.label}
                      >
                        {s.icon}
                      </button>
                    ))}
                    <button
                      className={`${styles.toolBtn} ${shapeFilled ? styles.toolBtnActive : ''}`}
                      onClick={() => setShapeFilled(f => !f)}
                      title={shapeFilled ? 'Outlined' : 'Filled'}
                      aria-label="Toggle fill"
                      style={{ fontSize: '0.7rem' }}
                    >
                      {shapeFilled ? '■' : '□'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Colors */}
          <div className={styles.toolGroup}>
            {colors.map((c) => (
              <button
                key={c}
                className={`${styles.colorBtn} ${activeColor === c ? styles.colorBtnActive : ''}`}
                style={{ background: c }}
                onClick={() => setActiveColor(c)}
                title={c}
                aria-label={`Color: ${c}`}
              />
            ))}
          </div>

          {/* Stroke widths */}
          <div className={styles.toolGroup}>
            {widths.map((w) => {
              const px = resolveStrokeWidth(w);
              return (
                <button
                  key={w}
                  className={`${styles.widthBtn} ${activeWidthName === w ? styles.widthBtnActive : ''}`}
                  onClick={() => { setActiveWidth(px); setActiveWidthName(w); }}
                  title={`${w} stroke`}
                  aria-label={`Stroke width: ${w}`}
                >
                  <span className={styles.widthDot} style={{ width: px * 2.5, height: px * 2.5 }} />
                </button>
              );
            })}
          </div>

          {/* Undo / Redo / Clear */}
          <div className={styles.toolGroup}>
            <button
              className={styles.toolBtn}
              onClick={handleUndo}
              disabled={strokes.length === 0}
              title="Undo (Ctrl+Z)"
              aria-label="Undo"
              style={{ opacity: strokes.length === 0 ? 0.4 : 1 }}
            >
              ↩️
            </button>
            <button
              className={styles.toolBtn}
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              title="Redo (Ctrl+Shift+Z)"
              aria-label="Redo"
              style={{ opacity: redoStack.length === 0 ? 0.4 : 1 }}
            >
              ↪️
            </button>
            <button
              className={styles.toolBtn}
              onClick={() => setShowClearConfirm(true)}
              disabled={strokes.length === 0}
              title="Clear all"
              aria-label="Clear canvas"
              style={{ opacity: strokes.length === 0 ? 0.4 : 1 }}
            >
              🗑️
            </button>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className={styles.canvasWrapper} style={{ height: canvasHeight }}>
        <canvas
          ref={canvasRef}
          className={`${styles.canvas} ${submitted ? styles.canvasLocked : ''}`}
          style={{ height: canvasHeight, cursor: TOOL_DEFS[activeTool]?.cursor || 'crosshair' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />

        {/* Text input overlay */}
        {textInputPos && !submitted && (
          <input
            ref={textInputRef}
            className={styles.textInput}
            style={{ left: textInputPos.x, top: textInputPos.y }}
            value={textInputValue}
            onChange={(e) => setTextInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') commitTextLabel(); if (e.key === 'Escape') setTextInputPos(null); }}
            onBlur={commitTextLabel}
            placeholder="Type label..."
          />
        )}

        {/* Clear confirmation */}
        {showClearConfirm && (
          <div className={styles.confirmOverlay}>
            <div className={styles.confirmDialog}>
              <p className={styles.confirmTitle}>Clear all marks?</p>
              <p className={styles.confirmDesc}>This will remove all your drawing. This cannot be undone.</p>
              <div className={styles.confirmActions}>
                <button className={styles.confirmCancel} onClick={() => setShowClearConfirm(false)}>Cancel</button>
                <button className={styles.confirmDanger} onClick={handleClear}>Clear</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit bar */}
      {!submitted ? (
        <div className={styles.submitBar}>
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {submitting ? '⏳ Submitting...' : '📤 Submit Drawing'}
          </button>
          <button
            className={styles.photoLink}
            onClick={() => photoInputRef.current?.click()}
          >
            📷 Prefer to work on paper? Take a photo instead.
          </button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoUpload}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div className={styles.submittedBanner}>
          ✅ Drawing submitted — your teacher will review it.
        </div>
      )}
    </div>
  );
}
