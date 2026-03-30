// ============================================
// Canvas Overlays — Home Plus Drawing Canvas
// ============================================
// Background overlays render behind student strokes.
// They are NOT affected by undo/clear — only student marks are.

import type { DrawingOverlayType, DrawingOverlayConfig } from '@/lib/lesson-types';

export function renderOverlay(
  ctx: CanvasRenderingContext2D,
  type: DrawingOverlayType | undefined,
  config: DrawingOverlayConfig | undefined,
  width: number,
  height: number,
  dpr: number,
): void {
  if (!type || type === 'none') return;

  switch (type) {
    case 'square-grid':
      renderSquareGrid(ctx, config, width, height, dpr);
      break;
    case 'dot-grid':
      renderDotGrid(ctx, config, width, height, dpr);
      break;
    case 'baseline-lines':
      renderBaselineLines(ctx, config, width, height, dpr);
      break;
    case 'coordinate-plane':
      renderCoordinatePlane(ctx, config, width, height, dpr);
      break;
    case 'number-line':
      renderNumberLine(ctx, config, width, height, dpr);
      break;
    case 'data-table':
      renderDataTable(ctx, config, width, height, dpr);
      break;
    case 'fraction-model':
      renderFractionModel(ctx, config, width, height, dpr);
      break;
    // Tier 3 stubs — implemented when needed
    case 'isometric-grid':
    case 'stem-leaf':
    case 'circle-graph':
    case 'map-alberta':
    case 'map-canada':
    case 'map-world':
    case 'map-blank':
      renderPlaceholder(ctx, type, width, height, dpr);
      break;
  }
}

// ─── Square Grid ───

function renderSquareGrid(
  ctx: CanvasRenderingContext2D,
  config: DrawingOverlayConfig | undefined,
  width: number,
  height: number,
  dpr: number,
): void {
  const gridSize = (config?.gridSize || 20) * dpr;
  const color = config?.gridColor || '#e0e0e0';

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.5 * dpr;

  // Vertical lines
  for (let x = gridSize; x < width * dpr; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height * dpr);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = gridSize; y < height * dpr; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width * dpr, y);
    ctx.stroke();
  }

  ctx.restore();
}

// ─── Dot Grid ───

function renderDotGrid(
  ctx: CanvasRenderingContext2D,
  config: DrawingOverlayConfig | undefined,
  width: number,
  height: number,
  dpr: number,
): void {
  const gridSize = (config?.gridSize || 20) * dpr;
  const color = config?.gridColor || '#cbd5e1';
  const dotRadius = 1 * dpr;

  ctx.save();
  ctx.fillStyle = color;

  for (let x = gridSize; x < width * dpr; x += gridSize) {
    for (let y = gridSize; y < height * dpr; y += gridSize) {
      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

// ─── Baseline Lines (Handwriting) ───

function renderBaselineLines(
  ctx: CanvasRenderingContext2D,
  config: DrawingOverlayConfig | undefined,
  width: number,
  height: number,
  dpr: number,
): void {
  const spacing = (config?.lineSpacing || 32) * dpr;
  const showMargin = config?.marginLine ?? false;

  ctx.save();
  ctx.strokeStyle = '#bfdbfe';
  ctx.lineWidth = 0.8 * dpr;

  // Horizontal lines
  for (let y = spacing; y < height * dpr; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width * dpr, y);
    ctx.stroke();
  }

  // Red margin line
  if (showMargin) {
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 1 * dpr;
    const marginX = 40 * dpr;
    ctx.beginPath();
    ctx.moveTo(marginX, 0);
    ctx.lineTo(marginX, height * dpr);
    ctx.stroke();
  }

  ctx.restore();
}

// ─── Coordinate Plane ───

function renderCoordinatePlane(
  ctx: CanvasRenderingContext2D,
  config: DrawingOverlayConfig | undefined,
  width: number,
  height: number,
  dpr: number,
): void {
  const xMin = config?.xMin ?? -10;
  const xMax = config?.xMax ?? 10;
  const yMin = config?.yMin ?? -10;
  const yMax = config?.yMax ?? 10;
  const xStep = config?.xStep ?? 1;
  const yStep = config?.yStep ?? 1;
  const xLabel = config?.xLabel ?? 'x';
  const yLabel = config?.yLabel ?? 'y';
  const showGrid = config?.showGridLines ?? true;
  const quadrant = config?.quadrants ?? '1-4';

  const W = width * dpr;
  const H = height * dpr;
  const rangeX = xMax - xMin;
  const rangeY = yMax - yMin;

  // Map data coordinates to canvas pixels
  const toCanvasX = (v: number) => ((v - xMin) / rangeX) * W;
  const toCanvasY = (v: number) => H - ((v - yMin) / rangeY) * H;

  ctx.save();

  // Gridlines
  if (showGrid) {
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5 * dpr;

    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      if (x === 0) continue; // draw axis separately
      const px = toCanvasX(x);
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, H);
      ctx.stroke();
    }

    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
      if (y === 0) continue;
      const py = toCanvasY(y);
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(W, py);
      ctx.stroke();
    }
  }

  // Axes
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 1.5 * dpr;

  // X axis
  const axisY = toCanvasY(0);
  if (axisY >= 0 && axisY <= H) {
    ctx.beginPath();
    ctx.moveTo(0, axisY);
    ctx.lineTo(W, axisY);
    ctx.stroke();
  }

  // Y axis
  const axisX = toCanvasX(0);
  if (axisX >= 0 && axisX <= W) {
    ctx.beginPath();
    ctx.moveTo(axisX, 0);
    ctx.lineTo(axisX, H);
    ctx.stroke();
  }

  // Tick marks and labels
  ctx.fillStyle = '#6b7280';
  ctx.font = `${10 * dpr}px -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
    if (x === 0) continue;
    const px = toCanvasX(x);
    // Tick
    ctx.beginPath();
    ctx.moveTo(px, axisY - 3 * dpr);
    ctx.lineTo(px, axisY + 3 * dpr);
    ctx.stroke();
    // Label
    ctx.fillText(String(x), px, axisY + 5 * dpr);
  }

  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
    if (y === 0) continue;
    const py = toCanvasY(y);
    // Tick
    ctx.beginPath();
    ctx.moveTo(axisX - 3 * dpr, py);
    ctx.lineTo(axisX + 3 * dpr, py);
    ctx.stroke();
    // Label
    ctx.fillText(String(y), axisX - 6 * dpr, py);
  }

  // Axis labels
  ctx.fillStyle = '#374151';
  ctx.font = `bold ${12 * dpr}px -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(xLabel, W - 14 * dpr, axisY + 10 * dpr);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText(yLabel, axisX + 8 * dpr, 14 * dpr);

  ctx.restore();
}

// ─── Number Line ───

function renderNumberLine(
  ctx: CanvasRenderingContext2D,
  config: DrawingOverlayConfig | undefined,
  width: number,
  height: number,
  dpr: number,
): void {
  const min = config?.min ?? 0;
  const max = config?.max ?? 10;
  const step = config?.step ?? 1;
  const labelEvery = config?.labelEvery ?? 1;
  const showArrows = config?.showArrows ?? true;

  const W = width * dpr;
  const H = height * dpr;
  const lineY = H / 2;
  const padding = 40 * dpr;
  const lineStart = padding;
  const lineEnd = W - padding;
  const range = max - min;

  const toX = (v: number) => lineStart + ((v - min) / range) * (lineEnd - lineStart);

  ctx.save();

  // Main line
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 2 * dpr;
  ctx.beginPath();
  ctx.moveTo(lineStart, lineY);
  ctx.lineTo(lineEnd, lineY);
  ctx.stroke();

  // Arrows
  if (showArrows) {
    const arrowLen = 8 * dpr;
    // Left arrow
    ctx.beginPath();
    ctx.moveTo(lineStart, lineY);
    ctx.lineTo(lineStart + arrowLen, lineY - arrowLen * 0.6);
    ctx.moveTo(lineStart, lineY);
    ctx.lineTo(lineStart + arrowLen, lineY + arrowLen * 0.6);
    ctx.stroke();
    // Right arrow
    ctx.beginPath();
    ctx.moveTo(lineEnd, lineY);
    ctx.lineTo(lineEnd - arrowLen, lineY - arrowLen * 0.6);
    ctx.moveTo(lineEnd, lineY);
    ctx.lineTo(lineEnd - arrowLen, lineY + arrowLen * 0.6);
    ctx.stroke();
  }

  // Tick marks and labels
  ctx.fillStyle = '#374151';
  ctx.font = `${11 * dpr}px -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  let labelIdx = 0;
  for (let v = min; v <= max; v += step) {
    const x = toX(v);
    const tickH = 6 * dpr;

    ctx.beginPath();
    ctx.moveTo(x, lineY - tickH);
    ctx.lineTo(x, lineY + tickH);
    ctx.stroke();

    if (labelIdx % labelEvery === 0) {
      // Format: show as integer if whole, else 1 decimal
      const label = Number.isInteger(v) ? String(v) : v.toFixed(1);
      ctx.fillText(label, x, lineY + tickH + 4 * dpr);
    }
    labelIdx++;
  }

  ctx.restore();
}

// ─── Data Table Overlay ───

function renderDataTable(
  ctx: CanvasRenderingContext2D,
  config: DrawingOverlayConfig | undefined,
  width: number,
  height: number,
  dpr: number,
): void {
  const rows = config?.rows ?? 4;
  const cols = config?.cols ?? 3;
  const cellH = (config?.cellHeight ?? 40) * dpr;
  const headers = config?.headers || [];
  const rowHeaders = config?.rowHeaders || [];

  const W = width * dpr;
  const padding = 30 * dpr;
  const hasRowHeaders = rowHeaders.length > 0;

  // Calculate cell width
  const rowHeaderWidth = hasRowHeaders ? 100 * dpr : 0;
  const tableWidth = W - padding * 2 - rowHeaderWidth;
  const cellW = tableWidth / cols;

  const startX = padding + rowHeaderWidth;
  const startY = padding;

  ctx.save();

  // Table grid lines
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1 * dpr;

  // Draw columns
  for (let c = 0; c <= cols; c++) {
    const x = startX + c * cellW;
    ctx.beginPath();
    ctx.moveTo(x, startY);
    ctx.lineTo(x, startY + (rows + 1) * cellH); // +1 for header row
    ctx.stroke();
  }

  // Row headers column line
  if (hasRowHeaders) {
    ctx.beginPath();
    ctx.moveTo(padding, startY);
    ctx.lineTo(padding, startY + (rows + 1) * cellH);
    ctx.stroke();
  }

  // Draw rows
  for (let r = 0; r <= rows + 1; r++) {
    const y = startY + r * cellH;
    const lineStart = hasRowHeaders ? padding : startX;
    ctx.beginPath();
    ctx.moveTo(lineStart, y);
    ctx.lineTo(startX + cols * cellW, y);
    ctx.stroke();
  }

  // Header row background
  ctx.fillStyle = '#f1f5f9';
  const headerLeft = hasRowHeaders ? padding : startX;
  ctx.fillRect(headerLeft, startY, startX + cols * cellW - headerLeft, cellH);
  // Redraw header row borders
  ctx.strokeRect(headerLeft, startY, startX + cols * cellW - headerLeft, cellH);

  // Header text
  ctx.fillStyle = '#374151';
  ctx.font = `bold ${11 * dpr}px -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let c = 0; c < cols; c++) {
    if (headers[c]) {
      ctx.fillText(headers[c], startX + c * cellW + cellW / 2, startY + cellH / 2);
    }
  }

  // Row header text
  if (hasRowHeaders) {
    ctx.textAlign = 'center';
    for (let r = 0; r < rows; r++) {
      if (rowHeaders[r]) {
        ctx.fillText(
          rowHeaders[r],
          padding + rowHeaderWidth / 2,
          startY + (r + 1) * cellH + cellH / 2,
        );
      }
    }
  }

  ctx.restore();
}

// ─── Fraction / Area Model Overlay ───

function renderFractionModel(
  ctx: CanvasRenderingContext2D,
  config: DrawingOverlayConfig | undefined,
  width: number,
  height: number,
  dpr: number,
): void {
  const modelType = config?.type ?? 'bar';
  const rows = config?.rows ?? 1;
  const cols = config?.cols ?? 4;

  const W = width * dpr;
  const H = height * dpr;
  const padding = 40 * dpr;

  if (modelType === 'bar') {
    // Single-row fraction bar
    const barHeight = 60 * dpr;
    const barWidth = W - padding * 2;
    const cellW = barWidth / cols;
    const barY = H / 2 - barHeight / 2;

    ctx.save();

    // Bar outline
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2 * dpr;
    ctx.strokeRect(padding, barY, barWidth, barHeight);

    // Cell dividers
    ctx.lineWidth = 1.5 * dpr;
    for (let c = 1; c < cols; c++) {
      const x = padding + c * cellW;
      ctx.beginPath();
      ctx.moveTo(x, barY);
      ctx.lineTo(x, barY + barHeight);
      ctx.stroke();
    }

    // Fraction labels below
    ctx.fillStyle = '#6b7280';
    ctx.font = `${10 * dpr}px -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let c = 0; c < cols; c++) {
      ctx.fillText(
        `1/${cols}`,
        padding + c * cellW + cellW / 2,
        barY + barHeight + 6 * dpr,
      );
    }

    ctx.restore();
  } else {
    // Area model (grid)
    const gridW = Math.min(W - padding * 2, H - padding * 2);
    const cellW = gridW / cols;
    const cellH = gridW / rows;
    const startX = (W - gridW) / 2;
    const startY = (H - rows * cellH) / 2;

    ctx.save();

    // Grid outline
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2 * dpr;
    ctx.strokeRect(startX, startY, cols * cellW, rows * cellH);

    // Cell dividers
    ctx.lineWidth = 1.5 * dpr;

    // Vertical
    for (let c = 1; c < cols; c++) {
      const x = startX + c * cellW;
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, startY + rows * cellH);
      ctx.stroke();
    }

    // Horizontal
    for (let r = 1; r < rows; r++) {
      const y = startY + r * cellH;
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(startX + cols * cellW, y);
      ctx.stroke();
    }

    ctx.restore();
  }
}

// ─── Placeholder for unimplemented overlays ───

function renderPlaceholder(
  ctx: CanvasRenderingContext2D,
  type: string,
  width: number,
  height: number,
  dpr: number,
): void {
  ctx.save();
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, width * dpr, height * dpr);
  ctx.fillStyle = '#94a3b8';
  ctx.font = `${14 * dpr}px -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${type} overlay — coming soon`, (width * dpr) / 2, (height * dpr) / 2);
  ctx.restore();
}
