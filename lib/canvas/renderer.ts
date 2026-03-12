import { CanvasElement, Point, Viewport } from "@/types/canvas";
import { getCanvasTheme } from "./theme";
import { getElementBounds } from "./hit";

const DASH_PATTERNS: Record<string, number[]> = {
  solid: [],
  dashed: [8, 4],
  dotted: [2, 4],
};

const FONT_SIZE_MAP: Record<string, number> = {
  sm: 14,
  md: 18,
  lg: 24,
  xl: 32,
};

const FONT_FAMILY_MAP: Record<string, string> = {
  sans: "Inter, sans-serif",
  serif: "Georgia, serif",
  mono: "Fira Code, monospace",
  handwriting: "Caveat, cursive",
};

const SELECTION_PADDING = 6;
const HANDLE_SIZE = 8;

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  elements: CanvasElement[],
  viewport: Viewport,
  selectedIds: string[] = [],
  selectionBox?: { x: number; y: number; width: number; height: number } | null,
  isRotating?: boolean,
) {
  const { width, height } = ctx.canvas;
  const theme = getCanvasTheme();

  ctx.clearRect(0, 0, width, height);

  ctx.save();
  ctx.translate(viewport.x, viewport.y);
  ctx.scale(viewport.zoom, viewport.zoom);

  for (const el of elements) {
    if (el.isHidden) continue;

    ctx.save();
    applyTransform(ctx, el);
    applyStrokeStyle(ctx, el, theme);

    drawElement(ctx, el);

    ctx.restore();
  }
  for (const el of elements) {
    if (!selectedIds.includes(el.id) || el.isHidden) continue;
    ctx.save();
    applyTransform(ctx, el);
    drawSelectionOutline(ctx, el, theme, selectedIds.length === 1);
    ctx.restore();
  }
  if (selectedIds.length > 1 && !isRotating) {
    const selected = elements.filter((el) => selectedIds.includes(el.id));
    drawMultipleSelectionOutline(ctx, selected, theme);
  }
  if (selectionBox) {
    ctx.strokeStyle = theme.selection;
    ctx.fillStyle = theme.selectionFill;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(
      selectionBox.x,
      selectionBox.y,
      selectionBox.width,
      selectionBox.height,
    );
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.restore();
}

function applyTransform(ctx: CanvasRenderingContext2D, el: CanvasElement) {
  ctx.globalAlpha = el.opacity ?? 1;

  const angle = el.angle ?? 0;
  if (!angle) return;

  let cx: number, cy: number;

  if (el.type === "pen" || el.type === "line" || el.type === "arrow") {
    const xs = el.points.map((p) => p.x);
    const ys = el.points.map((p) => p.y);
    const left = Math.min(...xs);
    const right = Math.max(...xs);
    const top = Math.min(...ys);
    const bottom = Math.max(...ys);
    cx = (left + right) / 2;
    cy = (top + bottom) / 2;
  } else {
    cx = el.x + el.width / 2;
    cy = el.y + el.height / 2;
  }

  ctx.translate(cx, cy);
  ctx.rotate(el.angle);
  ctx.translate(-cx, -cy);
}

function applyStrokeStyle(
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
  theme: ReturnType<typeof getCanvasTheme>,
) {
  ctx.strokeStyle = el.strokeColor ? el.strokeColor : theme.strokeColor;
  ctx.fillStyle =
    el.fillColor == "transparent" ? "rgba(0,0,0,0)" : el.fillColor;
  ctx.lineWidth = el.strokeWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.setLineDash(DASH_PATTERNS[el.strokeStyle ?? []]);
}

function drawElement(ctx: CanvasRenderingContext2D, el: CanvasElement) {
  switch (el.type) {
    case "rect":
      return drawRect(ctx, el);
    case "circle":
      return drawCircle(ctx, el);
    case "diamond":
      return drawDiamond(ctx, el);
    case "pen":
      return drawPen(ctx, el);
    case "line":
      return drawLine(ctx, el);
    case "arrow":
      return drawArrow(ctx, el);
    case "text":
      return drawText(ctx, el);
    // case "image":
    //   return drawImage(ctx, el);
    // case "frame":
    //   return drawFrame(ctx, el);
  }
}

function drawRect(
  ctx: CanvasRenderingContext2D,
  el: Extract<CanvasElement, { type: "rect" }>,
) {
  const { x, y, width, height, cornerRadius } = el;

  const minSide = Math.min(Math.abs(width), Math.abs(height));

  const maxAllowed = minSide / 4;
  const radius = Math.min(cornerRadius, maxAllowed);

  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
  ctx.stroke();
}

function drawCircle(
  ctx: CanvasRenderingContext2D,
  el: Extract<CanvasElement, { type: "circle" }>,
) {
  const { x, y, width, height } = el;

  ctx.beginPath();
  ctx.ellipse(
    x + width / 2,
    y + height / 2,
    Math.abs(width / 2),
    Math.abs(height / 2),
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.stroke();
}

function drawDiamond(
  ctx: CanvasRenderingContext2D,
  el: Extract<CanvasElement, { type: "diamond" }>,
) {
  const { x, y, width, height, cornerRadius } = el;
  const cx = x + width / 2;
  const cy = y + height / 2;

  const minSide = Math.min(Math.abs(width), Math.abs(height));
  const r = Math.min(cornerRadius, minSide / 8);

  const top = { x: cx, y: y };
  const right = { x: x + width, y: cy };
  const bottom = { x: cx, y: y + height };
  const left = { x: x, y: cy };

  function offsetPoint(
    from: { x: number; y: number },
    to: { x: number; y: number },
    dist: number,
  ) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy);
    return {
      x: from.x + (dx / len) * dist,
      y: from.y + (dy / len) * dist,
    };
  }

  const corners = [
    { tip: top, prev: left, next: right },
    { tip: right, prev: top, next: bottom },
    { tip: bottom, prev: right, next: left },
    { tip: left, prev: bottom, next: top },
  ];

  ctx.beginPath();

  corners.forEach(({ tip, prev, next }, i) => {
    const entry = offsetPoint(tip, prev, r);
    const exit = offsetPoint(tip, next, r);

    if (i === 0) {
      ctx.moveTo(entry.x, entry.y);
    } else {
      ctx.lineTo(entry.x, entry.y);
    }

    // Curve through the tip
    ctx.quadraticCurveTo(tip.x, tip.y, exit.x, exit.y);
  });

  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawLine(
  ctx: CanvasRenderingContext2D,
  el: Extract<CanvasElement, { type: "line" }>,
) {
  if (!el.points || el.points.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(el.points[0].x, el.points[0].y);
  for (let i = 1; i < el.points.length; i++) {
    ctx.lineTo(el.points[i].x, el.points[i].y);
  }
  ctx.stroke();
}

function drawPen(
  ctx: CanvasRenderingContext2D,
  el: Extract<CanvasElement, { type: "pen" }>,
) {
  if (el.points.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(el.points[0].x, el.points[0].y);
  for (let i = 1; i < el.points.length - 1; i++) {
    const mx = (el.points[i].x + el.points[i + 1].x) / 2;
    const my = (el.points[i].y + el.points[i + 1].y) / 2;
    ctx.quadraticCurveTo(el.points[i].x, el.points[i].y, mx, my);
  }
  const last = el.points[el.points.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  el: Extract<CanvasElement, { type: "arrow" }>,
) {
  if (el.points.length < 2) return;

  const start = el.points[0];
  const end = el.points[el.points.length - 1];

  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  for (let i = 1; i < el.points.length; i++) {
    ctx.lineTo(el.points[i].x, el.points[i].y);
  }

  ctx.stroke();

  if (el.startArrowhead !== "none") {
    drawArrowhead(
      ctx,
      el.points[el.points.length - 2],
      end,
      el.endArrowhead,
      el.strokeWidth,
    );
  }
  if (el.startArrowhead !== "none") {
    drawArrowhead(ctx, el.points[1], start, el.startArrowhead, el.strokeWidth);
  }
}

function drawArrowhead(
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  style: string,
  strokeWidth: number,
) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const size = strokeWidth * 4 + 8;

  ctx.save();
  ctx.translate(to.x, to.y);
  ctx.rotate(angle);

  if (style === "arrow") {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size, -size / 2.5);
    ctx.lineTo(-size, size / 2.5);
    ctx.closePath();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
  } else if (style === "dot") {
    ctx.beginPath();
    ctx.arc(0, 0, size / 3, 0, Math.PI * 2);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
  } else if (style === "diamond") {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size / 2, -size / 3);
    ctx.lineTo(-size, 0);
    ctx.lineTo(-size / 2, size / 3);
    ctx.closePath();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
  }

  ctx.restore();
}

function drawText(
  ctx: CanvasRenderingContext2D,
  el: Extract<CanvasElement, { type: "text" }>,
) {
  if (!el.content) return;

  const fontSize = FONT_SIZE_MAP[el.fontSize] ?? 18;
  const fontFamily = FONT_FAMILY_MAP[el.fontFamily] ?? "sans-serif";

  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = el.strokeColor;
  ctx.textAlign = el.textAlign as CanvasTextAlign;
  ctx.textBaseline = "top";
  const lines = el.content.split("\n");
  const lineHeight = fontSize * 1.4;
  const startX =
    el.textAlign === "center"
      ? el.x + el.width / 2
      : el.textAlign === "right"
        ? el.x + el.width
        : el.x;

  lines.forEach((line, i) => {
    ctx.fillText(line, startX, el.y + i * lineHeight, el.width);
  });
}

function drawSelectionOutline(
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
  theme: ReturnType<typeof getCanvasTheme>,
  isSingle: boolean,
) {
  const p = SELECTION_PADDING;
  const b = getElementBounds(el);

  const x = b.left - p;
  const y = b.top - p;
  const w = b.right - b.left + p * 2;
  const h = b.bottom - b.top + p * 2;

  // Selection outline
  ctx.strokeStyle = theme.selection;
  ctx.fillStyle = "transparent";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.stroke();

  // Handles
  if (!isSingle) return;
  const handles = getHandlePositions(x, y, w, h);
  for (const handle of handles) {
    ctx.fillStyle = theme.handle;
    ctx.strokeStyle = theme.handleBorder;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(
      handle.x - HANDLE_SIZE / 2,
      handle.y - HANDLE_SIZE / 2,
      HANDLE_SIZE,
      HANDLE_SIZE,
      2,
    );
    ctx.fill();
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y - 2 * p, 4, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawMultipleSelectionOutline(
  ctx: CanvasRenderingContext2D,
  elements: CanvasElement[],
  theme: ReturnType<typeof getCanvasTheme>,
) {
  if (elements.length === 0) return;
  const p = SELECTION_PADDING;

  const allBounds = elements.map(getElementBounds);
  const left = Math.min(...allBounds.map((b) => b.left));
  const right = Math.max(...allBounds.map((b) => b.right));
  const top = Math.min(...allBounds.map((b) => b.top));
  const bottom = Math.max(...allBounds.map((b) => b.bottom));

  const x = left - p;
  const y = top - p;
  const w = right - left + p * 2;
  const h = bottom - top + p * 2;

  // Selection outline
  ctx.strokeStyle = theme.selection;
  ctx.fillStyle = "transparent";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.setLineDash([3, 2]);

  ctx.rect(x, y, w, h);
  ctx.stroke();

  // Handles
  const handles = getHandlePositions(x, y, w, h);
  for (const handle of handles) {
    ctx.fillStyle = theme.handle;
    ctx.strokeStyle = theme.handleBorder;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.roundRect(
      handle.x - HANDLE_SIZE / 2,
      handle.y - HANDLE_SIZE / 2,
      HANDLE_SIZE,
      HANDLE_SIZE,
      2,
    );
    ctx.fill();
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y - 2 * p, 4, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

export function getHandlePositions(
  x: number,
  y: number,
  w: number,
  h: number,
): Point[] {
  return [
    { x: x, y: y },
    { x: x + w, y: y },
    { x: x + w, y: y + h },
    { x: x, y: y + h },
  ];
}
