export function getCanvasTheme() {
  if (typeof window === "undefined") return fallbackTheme

  const get = (v: string) => getComputedStyle(document.documentElement)
    .getPropertyValue(v).trim()

  return {
    strokeColor:   `oklch(${get("--stroke-1-raw")})`,
    selection:     `oklch(${get("--primary-raw")})`,
    selectionFill: `oklch(${get("--primary-raw")} / 0.08)`,
    handle:        `oklch(${get("--background-raw")})`,
    handleBorder:  `oklch(${get("--primary-raw")})`,
    frameBorder:   `oklch(${get("--border-raw")})`,
    frameFill:     `oklch(${get("--background-raw")} / 0.4)`,
    frameLabel:    `oklch(${get("--muted-foreground-raw")})`,
    strokes: [
    `oklch(${get("--stroke-1-raw")})`,  // default dark/light
    `oklch(${get("--stroke-2-raw")})`,  // purple
    `oklch(${get("--stroke-3-raw")})`,  // red
    `oklch(${get("--stroke-4-raw")})`,  // medium purple
    `oklch(${get("--stroke-5-raw")})`,  // grey
    `oklch(${get("--stroke-6-raw")})`,  // black/white
  ]
  }
}

// Light mode values from your globals.css
const fallbackTheme = {
  strokeColor:   "oklch(0.2795 0.0368 260.0310)",   // --foreground
  selection:     "oklch(0.5854 0.2041 277.1173)",    // --primary
  selectionFill: "oklch(0.5854 0.2041 277.1173 / 0.08)",
  handle:        "oklch(0.9232 0.0026 48.7171)",     // --background
  handleBorder:  "oklch(0.5854 0.2041 277.1173)",    // --primary
  frameBorder:   "oklch(0.8687 0.0043 56.3660)",     // --border
  frameFill:     "oklch(0.9232 0.0026 48.7171 / 0.4)",
  frameLabel:    "oklch(0.5510 0.0234 264.3637)",    // --muted-foreground
}

export type CanvasTheme = typeof fallbackTheme