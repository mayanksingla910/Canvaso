"use client";
import { CanvasElement, Point } from "@/types/canvas";

const HIT_PADDING = 10;

export function hitTest(
  point: Point,
  elements: CanvasElement[],
  selectedIds: string[] = [],
): CanvasElement | null {
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];
    if (el.isHidden || el.isLocked) continue;
    if (selectedIds.includes(el.id) && hitTestBoundingBox(point, el)) return el

    if (hitTestElement(point, el)) return el;
  }
  return null;
}

function hitTestElement(point: Point, el: CanvasElement): boolean {
  switch (el.type) {
    case "rect":
    case "frame":
    case "image":
    case "text":
      return hitTestRect(point, el);
    case "diamond":
      return hitTestDiamond(point, el);
    case "circle":
      return hitTestCircle(point, el);
    case "line":
    case "arrow":
      return hitTestLine(point, el);
    case "pen":
      return hitTestPen(point, el);
    //   return hitTestText(point, el);
    default:
      return false;
  }
}

function hitTestRect(point: Point, el: CanvasElement): boolean {
  const { x, y, width, height } = el;
  const p = HIT_PADDING;

  const left = width >= 0 ? x : x + width;
  const top = height >= 0 ? y : y + height;
  const right = width >= 0 ? x + width : x;
  const bottom = height >= 0 ? y + height : y;

  const inBounds =
    point.x >= left - p &&
    point.x <= right + p &&
    point.y >= top - p &&
    point.y <= bottom + p;

  if (!inBounds) return false;

  if (!el.isSelected && (el.fillColor === "transparent" || el.fillColor === "rgba(0,0,0,0)")) {
    const onLeft = point.x <= left + p + 4;
    const onRight = point.x >= right - p - 4;
    const onTop = point.y <= top + p + 4;
    const onBottom = point.y >= bottom - p - 4;
    return onLeft || onRight || onTop || onBottom;
  }
  return true;
}

function hitTestDiamond(
  point: Point,
  el: Extract<CanvasElement, { type: "diamond" }>,
): boolean {
  const cx = el.x + el.width / 2;
  const cy = el.y + el.height / 2;
  const dx = Math.abs(point.x - cx);
  const dy = Math.abs(point.y - cy);

  const p = HIT_PADDING 

  const outerW = Math.abs(el.width) / 2 + p
  const outerH = Math.abs(el.height) / 2 + p
  const innerW = Math.abs(el.width) / 2 - p
  const innerH = Math.abs(el.height) / 2 - p

  const insideOuter = dx / outerW + dy / outerH <= 1

  if (!insideOuter) return false

  if (el.fillColor === "transparent" || el.fillColor === "rgba(0,0,0,0)") {
    const insideInner = innerW > 0 && innerH > 0
      ? dx / innerW + dy / innerH <= 1
      : false
    return !insideInner  
  }

  return true 
}

function hitTestCircle(
  point: Point,
  el: Extract<CanvasElement, { type: "circle" }>,
): boolean {
  const cx = el.x + el.width / 2;
  const cy = el.y + el.height / 2;
  const rx = Math.abs(el.width / 2) + HIT_PADDING;
  const ry = Math.abs(el.height / 2) + HIT_PADDING;

  const dx = point.x - cx;
  const dy = point.y - cy;
  const normalized = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);

  if (normalized > 1) return false;

  if (el.fillColor === "transparent" || el.fillColor === "rgba(0,0,0,0)") {
    const rxInner = Math.max(0, Math.abs(el.width / 2) - HIT_PADDING - 4);
    const ryInner = Math.max(0, Math.abs(el.height / 2) - HIT_PADDING - 4);
    const normalizedInner =
      (dx * dx) / (rxInner * rxInner) + (dy * dy) / (ryInner * ryInner);
    return normalizedInner >= 1;
  }

  return true;
}
function hitTestLine(
  point: Point,
  el: Extract<CanvasElement, { type: "line" | "arrow" }>,
): boolean {
  const [a, b] = el.points;
  return distanceToSegment(point, a, b) <= HIT_PADDING;
}

function hitTestPen(point: Point, el: { points: Point[] }): boolean {
  return hitTestPolyline(point, el.points);
}

function hitTestPolyline(point: Point, points: Point[]): boolean {
  for (let i = 0; i < points.length - 1; i++) {
    if (distanceToSegment(point, points[i], points[i + 1]) <= HIT_PADDING + 4) {
      return true;
    }
  }
  return false;
}

function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  const t = Math.max(
    0,
    Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq),
  );
  const closestX = a.x + t * dx;
  const closestY = a.y + t * dy;

  return Math.hypot(p.x - closestX, p.y - closestY);
}

function hitTestBoundingBox(point: Point, el: CanvasElement): boolean {
  let x: number, y: number, w: number, h: number

  if (el.type === "line" || el.type === "arrow") {
    x = Math.min(el.points[0].x, el.points[1].x)
    y = Math.min(el.points[0].y, el.points[1].y)
    w = Math.abs(el.points[1].x - el.points[0].x)
    h = Math.abs(el.points[1].y - el.points[0].y)
  } else if (el.type === "pen") {
    const xs = el.points.map(p => p.x)
    const ys = el.points.map(p => p.y)
    x = Math.min(...xs)
    y = Math.min(...ys)
    w = Math.max(...xs) - x
    h = Math.max(...ys) - y
  } else {
    x = el.width  >= 0 ? el.x : el.x + el.width
    y = el.height >= 0 ? el.y : el.y + el.height
    w = Math.abs(el.width)
    h = Math.abs(el.height)
  }

  const p = HIT_PADDING
  return (
    point.x >= x - p &&
    point.x <= x + w + p &&
    point.y >= y - p &&
    point.y <= y + h + p
  )
}