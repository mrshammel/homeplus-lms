// ============================================
// Canvas Tools - Home Plus Drawing Canvas
// ============================================
// Each tool implements the CanvasTool interface.
// Adding a new tool (Tier 2/3) = implementing this interface.

export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export interface StrokeObject {
  id: string;
  tool: ToolType;
  color: string;
  strokeWidth: number;
  opacity: number;
  points: Point[];
  text?: string;
  textPosition?: Point;
  // Tier 2: shape metadata
  shapeType?: ShapeType;
  radius?: number;
  shapeWidth?: number;
  shapeHeight?: number;
  filled?: boolean;
  // Stamp metadata
  stamp?: string;         // emoji character
  stampPosition?: Point;
  stampSize?: number;     // font size in px, default 32
}

export type ToolType = 'pen' | 'eraser' | 'highlighter' | 'arrow' | 'text'
  | 'ruler' | 'circle' | 'shape' | 'stamp';

export type ShapeType = 'rectangle' | 'square' | 'triangle' | 'circle' | 'pentagon' | 'hexagon' | 'octagon';

export interface CanvasToolState {
  color: string;
  strokeWidth: number;
  strokes: StrokeObject[];
}

export interface CanvasTool {
  name: ToolType;
  icon: string;
  label: string;
  cursor: string;
}

// ─── Stroke Rendering ───

const STROKE_WIDTHS = { thin: 1.5, medium: 3, thick: 6 } as const;

export function resolveStrokeWidth(option: string): number {
  return STROKE_WIDTHS[option as keyof typeof STROKE_WIDTHS] || STROKE_WIDTHS.medium;
}

const COLOR_MAP: Record<string, string> = {
  black: '#1e293b',
  blue: '#2563eb',
  red: '#dc2626',
  green: '#16a34a',
  orange: '#ea580c',
  purple: '#7c3aed',
  grey: '#9ca3af',
};

export function resolveColor(name: string): string {
  return COLOR_MAP[name] || name;
}

// ─── Catmull-Rom Spline Smoothing ───
// Converts raw pointer points into a smooth curve

function catmullRomSpline(points: Point[], segments = 8): Point[] {
  if (points.length < 3) return points;

  const result: Point[] = [points[0]];

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[Math.min(points.length - 1, i + 1)];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    for (let t = 1; t <= segments; t++) {
      const tt = t / segments;
      const tt2 = tt * tt;
      const tt3 = tt2 * tt;

      const x = 0.5 * (
        (2 * p1.x) +
        (-p0.x + p2.x) * tt +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * tt2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * tt3
      );
      const y = 0.5 * (
        (2 * p1.y) +
        (-p0.y + p2.y) * tt +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * tt2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * tt3
      );

      result.push({ x, y });
    }
  }

  return result;
}

// ─── Rendering Functions ───

export function renderStroke(ctx: CanvasRenderingContext2D, stroke: StrokeObject, dpr: number): void {
  switch (stroke.tool) {
    case 'pen':
      renderPenStroke(ctx, stroke, dpr);
      break;
    case 'highlighter':
      renderHighlighterStroke(ctx, stroke, dpr);
      break;
    case 'arrow':
      renderArrowStroke(ctx, stroke, dpr);
      break;
    case 'text':
      renderTextLabel(ctx, stroke, dpr);
      break;
    case 'ruler':
      renderRulerStroke(ctx, stroke, dpr);
      break;
    case 'circle':
      renderCircleStroke(ctx, stroke, dpr);
      break;
    case 'shape':
      renderShapeStroke(ctx, stroke, dpr);
      break;
    case 'stamp':
      renderStampStroke(ctx, stroke, dpr);
      break;
    // eraser strokes are not rendered - they remove other strokes
  }
}

function renderPenStroke(ctx: CanvasRenderingContext2D, stroke: StrokeObject, dpr: number): void {
  if (stroke.points.length < 2) return;

  const smoothed = catmullRomSpline(stroke.points, 6);

  ctx.save();
  ctx.globalAlpha = stroke.opacity;
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.strokeWidth * dpr;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(smoothed[0].x * dpr, smoothed[0].y * dpr);
  for (let i = 1; i < smoothed.length; i++) {
    ctx.lineTo(smoothed[i].x * dpr, smoothed[i].y * dpr);
  }
  ctx.stroke();
  ctx.restore();
}

function renderHighlighterStroke(ctx: CanvasRenderingContext2D, stroke: StrokeObject, dpr: number): void {
  if (stroke.points.length < 2) return;

  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = 14 * dpr;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(stroke.points[0].x * dpr, stroke.points[0].y * dpr);
  for (let i = 1; i < stroke.points.length; i++) {
    ctx.lineTo(stroke.points[i].x * dpr, stroke.points[i].y * dpr);
  }
  ctx.stroke();
  ctx.restore();
}

function renderArrowStroke(ctx: CanvasRenderingContext2D, stroke: StrokeObject, dpr: number): void {
  if (stroke.points.length < 2) return;

  const start = stroke.points[0];
  const end = stroke.points[stroke.points.length - 1];

  ctx.save();
  ctx.globalAlpha = stroke.opacity;
  ctx.strokeStyle = stroke.color;
  ctx.fillStyle = stroke.color;
  ctx.lineWidth = stroke.strokeWidth * dpr;
  ctx.lineCap = 'round';

  // Draw line
  ctx.beginPath();
  ctx.moveTo(start.x * dpr, start.y * dpr);
  ctx.lineTo(end.x * dpr, end.y * dpr);
  ctx.stroke();

  // Draw arrowhead
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const headLen = 12 * dpr;
  const headAngle = Math.PI / 6;

  ctx.beginPath();
  ctx.moveTo(end.x * dpr, end.y * dpr);
  ctx.lineTo(
    end.x * dpr - headLen * Math.cos(angle - headAngle),
    end.y * dpr - headLen * Math.sin(angle - headAngle),
  );
  ctx.lineTo(
    end.x * dpr - headLen * Math.cos(angle + headAngle),
    end.y * dpr - headLen * Math.sin(angle + headAngle),
  );
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function renderTextLabel(ctx: CanvasRenderingContext2D, stroke: StrokeObject, dpr: number): void {
  if (!stroke.text || !stroke.textPosition) return;

  ctx.save();
  ctx.globalAlpha = stroke.opacity;
  ctx.fillStyle = stroke.color;
  ctx.font = `${14 * dpr}px -apple-system, 'Segoe UI', Roboto, sans-serif`;
  ctx.textBaseline = 'top';
  ctx.fillText(stroke.text, stroke.textPosition.x * dpr, stroke.textPosition.y * dpr);
  ctx.restore();
}

// ─── Stamp (Emoji) rendering ───

function renderStampStroke(ctx: CanvasRenderingContext2D, stroke: StrokeObject, dpr: number): void {
  if (!stroke.stamp || !stroke.stampPosition) return;

  const size = (stroke.stampSize || 32) * dpr;

  ctx.save();
  ctx.globalAlpha = stroke.opacity;
  ctx.font = `${size}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(stroke.stamp, stroke.stampPosition.x * dpr, stroke.stampPosition.y * dpr);
  ctx.restore();
}

// ─── Eraser: Stroke intersection check ───

export function strokeIntersectsPath(stroke: StrokeObject, eraserPoints: Point[], eraserRadius: number): boolean {
  // Check if any point in the stroke is within eraserRadius of any eraser point
  for (const ep of eraserPoints) {
    for (const sp of stroke.points) {
      const dx = ep.x - sp.x;
      const dy = ep.y - sp.y;
      if (dx * dx + dy * dy < eraserRadius * eraserRadius) {
        return true;
      }
    }
    // Also check text labels
    if (stroke.tool === 'text' && stroke.textPosition) {
      const dx = ep.x - stroke.textPosition.x;
      const dy = ep.y - stroke.textPosition.y;
      if (dx * dx + dy * dy < (eraserRadius + 20) * (eraserRadius + 20)) {
        return true;
      }
    }
    // Also check stamps
    if (stroke.tool === 'stamp' && stroke.stampPosition) {
      const dx = ep.x - stroke.stampPosition.x;
      const dy = ep.y - stroke.stampPosition.y;
      const stampHitRadius = (stroke.stampSize || 32) / 2 + eraserRadius;
      if (dx * dx + dy * dy < stampHitRadius * stampHitRadius) {
        return true;
      }
    }
  }
  return false;
}

// ─── Tier 2: Ruler (Straight Line) ───

function renderRulerStroke(ctx: CanvasRenderingContext2D, stroke: StrokeObject, dpr: number): void {
  if (stroke.points.length < 2) return;

  const start = stroke.points[0];
  const end = stroke.points[stroke.points.length - 1];

  ctx.save();
  ctx.globalAlpha = stroke.opacity;
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.strokeWidth * dpr;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(start.x * dpr, start.y * dpr);
  ctx.lineTo(end.x * dpr, end.y * dpr);
  ctx.stroke();
  ctx.restore();
}

// ─── Tier 2: Circle ───

function renderCircleStroke(ctx: CanvasRenderingContext2D, stroke: StrokeObject, dpr: number): void {
  if (!stroke.radius || stroke.points.length < 1) return;

  const center = stroke.points[0];

  ctx.save();
  ctx.globalAlpha = stroke.opacity;
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.strokeWidth * dpr;

  ctx.beginPath();
  ctx.arc(center.x * dpr, center.y * dpr, stroke.radius * dpr, 0, Math.PI * 2);
  ctx.stroke();

  if (stroke.filled) {
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = stroke.color;
    ctx.fill();
  }
  ctx.restore();
}

// ─── Tier 2: Shapes ───

function renderShapeStroke(ctx: CanvasRenderingContext2D, stroke: StrokeObject, dpr: number): void {
  if (stroke.points.length < 2) return;

  const start = stroke.points[0];
  const end = stroke.points[stroke.points.length - 1];
  const w = (stroke.shapeWidth ?? (end.x - start.x)) * dpr;
  const h = (stroke.shapeHeight ?? (end.y - start.y)) * dpr;
  const sx = start.x * dpr;
  const sy = start.y * dpr;

  ctx.save();
  ctx.globalAlpha = stroke.opacity;
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.strokeWidth * dpr;
  ctx.lineJoin = 'round';

  switch (stroke.shapeType) {
    case 'rectangle':
    case 'square':
      ctx.strokeRect(sx, sy, w, h);
      if (stroke.filled) {
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = stroke.color;
        ctx.fillRect(sx, sy, w, h);
      }
      break;

    case 'triangle': {
      const midX = sx + w / 2;
      ctx.beginPath();
      ctx.moveTo(midX, sy);            // top center
      ctx.lineTo(sx + w, sy + h);      // bottom right
      ctx.lineTo(sx, sy + h);          // bottom left
      ctx.closePath();
      ctx.stroke();
      if (stroke.filled) {
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = stroke.color;
        ctx.fill();
      }
      break;
    }

    case 'pentagon':
    case 'hexagon':
    case 'octagon': {
      const sides = stroke.shapeType === 'pentagon' ? 5
        : stroke.shapeType === 'hexagon' ? 6 : 8;
      const cx = sx + w / 2;
      const cy = sy + h / 2;
      const r = Math.min(Math.abs(w), Math.abs(h)) / 2;
      drawRegularPolygon(ctx, cx, cy, r, sides);
      ctx.stroke();
      if (stroke.filled) {
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = stroke.color;
        ctx.fill();
      }
      break;
    }

    case 'circle': {
      const cx = sx + w / 2;
      const cy = sy + h / 2;
      const rx = Math.abs(w) / 2;
      const ry = Math.abs(h) / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      if (stroke.filled) {
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = stroke.color;
        ctx.fill();
      }
      break;
    }
  }

  ctx.restore();
}

function drawRegularPolygon(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  radius: number, sides: number,
): void {
  ctx.beginPath();
  for (let i = 0; i <= sides; i++) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2; // start from top
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

// ─── Ruler: Snap to angle helper ───

export function snapToAngle(start: Point, end: Point, shiftHeld: boolean): Point {
  if (!shiftHeld) return end;

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const angle = Math.atan2(dy, dx);
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Snap to 0°, 45°, 90°, 135°, 180°, etc.
  const snapAngles = [0, Math.PI / 4, Math.PI / 2, 3 * Math.PI / 4, Math.PI,
    -Math.PI / 4, -Math.PI / 2, -3 * Math.PI / 4];

  let closest = snapAngles[0];
  let minDiff = Math.abs(angle - snapAngles[0]);
  for (const sa of snapAngles) {
    const diff = Math.abs(angle - sa);
    if (diff < minDiff) {
      minDiff = diff;
      closest = sa;
    }
  }

  return {
    x: start.x + dist * Math.cos(closest),
    y: start.y + dist * Math.sin(closest),
  };
}

// ─── Tool Definitions ───

export const TOOL_DEFS: Record<ToolType, CanvasTool> = {
  pen: { name: 'pen', icon: '✏️', label: 'Pen', cursor: 'crosshair' },
  eraser: { name: 'eraser', icon: '', label: 'Eraser', cursor: 'cell' },
  highlighter: { name: 'highlighter', icon: '️', label: 'Highlighter', cursor: 'crosshair' },
  arrow: { name: 'arrow', icon: '➡️', label: 'Arrow', cursor: 'crosshair' },
  text: { name: 'text', icon: '', label: 'Text', cursor: 'text' },
  ruler: { name: 'ruler', icon: '', label: 'Line', cursor: 'crosshair' },
  circle: { name: 'circle', icon: '⭕', label: 'Circle', cursor: 'crosshair' },
  shape: { name: 'shape', icon: '⬡', label: 'Shapes', cursor: 'crosshair' },
  stamp: { name: 'stamp', icon: '', label: 'Stamp', cursor: 'pointer' },
};

// ─── Shape palette for the shapes sub-menu ───

export const SHAPE_OPTIONS: { type: ShapeType; icon: string; label: string }[] = [
  { type: 'rectangle', icon: '▭', label: 'Rectangle' },
  { type: 'triangle', icon: '△', label: 'Triangle' },
  { type: 'circle', icon: '○', label: 'Circle' },
  { type: 'pentagon', icon: '⬠', label: 'Pentagon' },
  { type: 'hexagon', icon: '⬡', label: 'Hexagon' },
];

// ─── Stamp / Emoji Palette ───

export const STAMP_CATEGORIES: { label: string; stamps: string[] }[] = [
  {
    label: 'Science',
    stamps: ['', '', '', '', '', '', '', '', '', '⚗️', '️', ''],
  },
  {
    label: 'Animals',
    stamps: ['', '', '', '', '', '', '', '', '', '', '', ''],
  },
  {
    label: 'Nature',
    stamps: ['☀️', '️', '❄️', '', '️', '', '', '', '', '⚡', '', ''],
  },
  {
    label: 'Labels',
    stamps: ['⬆️', '⬇️', '⬅️', '➡️', 'Tip:', '❌', '✅', '❓', '❗', '', '', ''],
  },
];

// ─── Unique ID generator ───

let _strokeId = 0;
export function nextStrokeId(): string {
  return `stroke-${Date.now()}-${++_strokeId}`;
}
