import Tesseract from 'tesseract.js';

/**
 * Convert canvas to image data URL
 */
export function canvasToImage(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png');
}

/**
 * Recognize handwriting from canvas using Tesseract OCR
 */
export async function recognizeHandwriting(
  canvas: HTMLCanvasElement,
  onProgress?: (progress: number) => void
): Promise<string> {
  const imageData = canvasToImage(canvas);

  const worker = await Tesseract.createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(m.progress);
      }
    },
  });

  try {
    const { data } = await worker.recognize(imageData);
    await worker.terminate();
    return data.text.trim();
  } catch (error) {
    await worker.terminate();
    throw new Error(`OCR failed: ${error}`);
  }
}

/**
 * Smooth a path using Bezier curve fitting
 * This beautifies handwritten strokes
 */
export interface Point {
  x: number;
  y: number;
}

export function smoothPath(points: Point[], tolerance: number = 1): Point[] {
  if (points.length < 3) return points;

  // Apply Ramer-Douglas-Peucker algorithm for path simplification
  const simplified = rdpSimplify(points, tolerance);

  // Apply Catmull-Rom spline for smooth curves
  return catmullRomSpline(simplified, 0.5, 10);
}

/**
 * Ramer-Douglas-Peucker algorithm for path simplification
 */
function rdpSimplify(points: Point[], tolerance: number): Point[] {
  if (points.length <= 2) return points;

  let maxDistance = 0;
  let maxIndex = 0;

  const first = points[0];
  const last = points[points.length - 1];

  // Find the point with maximum distance from the line
  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(points[i], first, last);
    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = i;
    }
  }

  // If max distance is greater than tolerance, recursively simplify
  if (maxDistance > tolerance) {
    const left = rdpSimplify(points.slice(0, maxIndex + 1), tolerance);
    const right = rdpSimplify(points.slice(maxIndex), tolerance);

    return [...left.slice(0, -1), ...right];
  } else {
    return [first, last];
  }
}

/**
 * Calculate perpendicular distance from point to line
 */
function perpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;

  const numerator = Math.abs(dy * point.x - dx * point.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x);
  const denominator = Math.sqrt(dx * dx + dy * dy);

  return numerator / denominator;
}

/**
 * Catmull-Rom spline interpolation for smooth curves
 */
function catmullRomSpline(points: Point[], tension: number, segments: number): Point[] {
  if (points.length < 2) return points;
  if (points.length === 2) return points;

  const result: Point[] = [];

  // Add first point
  result.push(points[0]);

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    for (let t = 0; t < segments; t++) {
      const tt = t / segments;
      const point = catmullRomPoint(p0, p1, p2, p3, tt, tension);
      result.push(point);
    }
  }

  // Add last point
  result.push(points[points.length - 1]);

  return result;
}

/**
 * Calculate a single point on Catmull-Rom spline
 */
function catmullRomPoint(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  t: number,
  tension: number
): Point {
  const t2 = t * t;
  const t3 = t2 * t;

  const v0x = (p2.x - p0.x) * tension;
  const v0y = (p2.y - p0.y) * tension;
  const v1x = (p3.x - p1.x) * tension;
  const v1y = (p3.y - p1.y) * tension;

  return {
    x: (2 * p1.x - 2 * p2.x + v0x + v1x) * t3 +
       (-3 * p1.x + 3 * p2.x - 2 * v0x - v1x) * t2 +
       v0x * t +
       p1.x,
    y: (2 * p1.y - 2 * p2.y + v0y + v1y) * t3 +
       (-3 * p1.y + 3 * p2.y - 2 * v0y - v1y) * t2 +
       v0y * t +
       p1.y,
  };
}

/**
 * Optional: Call local Ollama API for text improvement
 * Requires Ollama to be running on localhost:11434
 */
export async function improveTextWithLocalLLM(text: string): Promise<string> {
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama2', // or any other model you have installed
        prompt: `Clean up and improve this handwritten text, fixing any OCR errors and making it readable. Only return the corrected text, nothing else:\n\n${text}`,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error('Ollama API not available');
    }

    const data = await response.json();
    return data.response || text;
  } catch (error) {
    console.warn('Local LLM not available, returning original text:', error);
    return text;
  }
}
