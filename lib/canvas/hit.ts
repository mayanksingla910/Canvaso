"use client";
import { CanvasElement, Point } from "@/types/canvas";

const HIT_PADDING = 10;
const SELECTION_PADDING = 6;
const HANDLE_SIZE = 8;
const ROTATION_HANDLE_OFFSET = 20;
const ROTATION_HANDLE_RADIUS = 4;

export function hitTest(
  point: Point,
  elements: CanvasElement[],
  selectedIds: string[] = [],
): CanvasElement | null {
  if (selectedIds.length > 1) {
    const selectedElements = elements.filter((el) =>
      selectedIds.includes(el.id),
    );
    if (hitTestMultipleBoundingBoxes(point, selectedElements)) {
      return selectedElements[0];
    }
  }

  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];
    if (el.isHidden || el.isLocked) continue;
    if (selectedIds.includes(el.id) && hitTestBoundingBox(point, el)) return el;
    if (hitTestElement(point, el)) return el;
  }
  return null;
}

function hitTestElement(point: Point, el: CanvasElement): boolean {
  const localPoint = getLocalPoint(point, el);

  switch (el.type) {
    case "rect":
    case "frame":
    case "image":
    case "text":
      return hitTestRect(localPoint, el);
    case "diamond":
      return hitTestDiamond(localPoint, el);
    case "circle":
      return hitTestCircle(localPoint, el);
    case "line":
    case "arrow":
      return hitTestLine(localPoint, el);
    case "pen":
      return hitTestPen(localPoint, el);
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

  if (
    !el.isSelected &&
    (el.fillColor === "transparent" || el.fillColor === "rgba(0,0,0,0)")
  ) {
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

  const p = HIT_PADDING;

  const outerW = Math.abs(el.width) / 2 + p;
  const outerH = Math.abs(el.height) / 2 + p;
  const innerW = Math.abs(el.width) / 2 - p;
  const innerH = Math.abs(el.height) / 2 - p;

  const insideOuter = dx / outerW + dy / outerH <= 1;
  if (!insideOuter) return false;

  if (el.fillColor === "transparent" || el.fillColor === "rgba(0,0,0,0)") {
    const insideInner =
      innerW > 0 && innerH > 0 ? dx / innerW + dy / innerH <= 1 : false;
    return !insideInner;
  }

  return true;
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
  const localPoint = getLocalPoint(point, el);
  const p = HIT_PADDING;
  const b = getElementBounds(el);
  return (
    localPoint.x >= b.left - p &&
    localPoint.x <= b.right + p &&
    localPoint.y >= b.top - p &&
    localPoint.y <= b.bottom + p
  );
}

function hitTestMultipleBoundingBoxes(point: Point, els: CanvasElement[]) {
  const p = HIT_PADDING;
  const allBounds = els.map(getElementBounds);
  const left = Math.min(...allBounds.map((b) => b.left));
  const right = Math.max(...allBounds.map((b) => b.right));
  const top = Math.min(...allBounds.map((b) => b.top));
  const bottom = Math.max(...allBounds.map((b) => b.bottom));

  return (
    point.x >= left - p &&
    point.x <= right + p &&
    point.y >= top - p &&
    point.y <= bottom + p
  );
}

export function hitTestRotationHandle(
  point: Point,
  sides: { left: number; right: number; top: number; bottom: number },
  angle: number = 0,
  zoom: number =1,
): boolean {
  const p = SELECTION_PADDING /zoom;
  const offset = ROTATION_HANDLE_OFFSET / zoom;
  const hitRadius = (ROTATION_HANDLE_RADIUS + 4) / zoom;

  const cx = (sides.left + sides.right) / 2;
  const cy = (sides.top + sides.bottom) / 2;

  const rawHandleX = cx;
  const rawHandleY = sides.top - p - offset;

  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = rawHandleX - cx;
  const dy = rawHandleY - cy;

  const handleX = cx + dx * cos - dy * sin;
  const handleY = cy + dx * sin + dy * cos;

  return Math.hypot(point.x - handleX, point.y - handleY) <= hitRadius;
}

export function hitTestResizeHandle(point: Point, el: CanvasElement, zoom: number = 1): number {
  const localPoint = getLocalPoint(point, el);
  const p = SELECTION_PADDING /zoom;
  const hitRadius = (HANDLE_SIZE / 2 + 3) / zoom;

  const b = getElementBounds(el);

  const handles = [
    { x: b.left - p, y: b.top - p },
    { x: b.right + p, y: b.top - p },
    { x: b.right + p, y: b.bottom + p },
    { x: b.left - p, y: b.bottom + p },
  ];

  for (let i = 0; i < handles.length; i++) {
    const handle = handles[i];
    if (Math.hypot(localPoint.x - handle.x, localPoint.y - handle.y) <= hitRadius) {
      return i;
    }
  }

  return -1;
}

export function getElementBounds(el: CanvasElement) {
  if (el.type === "pen" || el.type === "line" || el.type === "arrow") {
    const xs = el.points.map((p) => p.x);
    const ys = el.points.map((p) => p.y);
    return {
      left: Math.min(...xs),
      right: Math.max(...xs),
      top: Math.min(...ys),
      bottom: Math.max(...ys),
    };
  }
  return {
    left: el.width >= 0 ? el.x : el.x + el.width,
    right: el.width >= 0 ? el.x + el.width : el.x,
    top: el.height >= 0 ? el.y : el.y + el.height,
    bottom: el.height >= 0 ? el.y + el.height : el.y,
  };
}

export function getLocalPoint(point: Point, el: CanvasElement): Point {
  const angle = el.angle ?? 0;
  if (angle === 0) return point;

  const b = getElementBounds(el);
  const cx = (b.left + b.right) / 2;
  const cy = (b.top + b.bottom) / 2;

  const cos = Math.cos(-angle);
  const sin = Math.sin(-angle);
  const dx = point.x - cx;
  const dy = point.y - cy;

  return {
    x: cx + dx * cos - dy * sin,
    y: cy + dx * sin + dy * cos,
  };
}
