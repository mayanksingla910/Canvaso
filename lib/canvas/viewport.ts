import { Bounds, Point, Viewport } from "@/types/canvas";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 20;
const ZOOM_SENSITIVITY = 0.03;
const ZOOM_STEP = 0.05;

export function screenToCanvas(point: Point, viewport: Viewport) {
  return {
    x: (point.x - viewport.x) / viewport.zoom,
    y: (point.y - viewport.y) / viewport.zoom,
  };
}

export function canvasToScreen(point: Point, viewport: Viewport) {
  return {
    x: point.x * viewport.zoom + viewport.x,
    y: point.y * viewport.zoom + viewport.y,
  };
}

export function zoomViewport(
  viewPort: Viewport,
  delta: number,
  origin: Point,
  mode: "wheel" | "pinch" = "wheel",
) {
  const zoomFactor =
    mode === "pinch"
      ? 1 - delta * ZOOM_SENSITIVITY
      : delta > 0
        ? 1 - ZOOM_STEP
        : 1 + ZOOM_STEP;

  const newZoom = clampZoom(viewPort.zoom * zoomFactor);
  const scale = newZoom / viewPort.zoom;

  return {
    zoom: newZoom,
    x: origin.x - (origin.x - viewPort.x) * scale,
    y: origin.y - (origin.y - viewPort.y) * scale,
  };
}

export function panViewport(viewPort: Viewport, delta: Point): Viewport {
  return {
    ...viewPort,
    x: viewPort.x + delta.x,
    y: viewPort.y + delta.y,
  };
}

export function resetViewport(): Viewport {
  return { x: 0, y: 0, zoom: 1 };
}

export function fitViewport(
  bounds: Bounds,
  screen: { width: number; height: number },
  padding = 40,
): Viewport {
  const zoom = Math.min(
    (screen.width - padding * 2) / bounds.width,
    (screen.height - padding * 2) / bounds.height,
  );

  return {
    zoom,
    x: (screen.width - bounds.width * zoom) / 2 - bounds.x * zoom,
    y: (screen.height - bounds.height * zoom) / 2 - bounds.y * zoom,
  };
}

export function zoomToLevel(
  viewport: Viewport,
  zoomLevel: number,
  screenCenter: Point
): Viewport {
  const newZoom = clampZoom(zoomLevel)
  const scale = newZoom / viewport.zoom

  return {
    zoom: newZoom,
    x: screenCenter.x - (screenCenter.x - viewport.x) * scale,
    y: screenCenter.y - (screenCenter.y - viewport.y) * scale,
  }
}

export function clampZoom(zoom: number): number {
  return Math.min(Math.max(zoom, MIN_ZOOM), MAX_ZOOM);
}

export function getZoomPercent(viewport: Viewport): number {
  return Math.round(viewport.zoom * 100);
}
