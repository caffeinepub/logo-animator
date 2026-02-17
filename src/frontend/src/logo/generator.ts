import { hashString, SeededRandom } from '../utils/seededRandom';
import type { LogoSpecification, Color, Shape } from '../backend';

export interface GeneratedLogoResult {
  specification: LogoSpecification;
  wordmark: string;
}

function extractWordmark(description: string): string {
  // Extract potential company name or meaningful words
  const words = description
    .split(/[,.\n]/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  if (words.length === 0) return 'Logo';

  // Try to find capitalized words (likely company names)
  const capitalizedWords = words[0]
    .split(' ')
    .filter(w => w.length > 0 && /^[A-Z]/.test(w))
    .slice(0, 3);

  if (capitalizedWords.length > 0) {
    return capitalizedWords.join(' ');
  }

  // Fall back to first few words
  return words[0]
    .split(' ')
    .filter(w => w.length > 2)
    .slice(0, 2)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ') || 'Logo';
}

function generateColors(rng: SeededRandom, description: string): Color[] {
  const lowerDesc = description.toLowerCase();
  
  // Detect color hints in description
  const colorHints = {
    blue: [{ r: 59, g: 130, b: 246 }, { r: 37, g: 99, b: 235 }],
    green: [{ r: 34, g: 197, b: 94 }, { r: 22, g: 163, b: 74 }],
    red: [{ r: 239, g: 68, b: 68 }, { r: 220, g: 38, b: 38 }],
    purple: [{ r: 168, g: 85, b: 247 }, { r: 147, g: 51, b: 234 }],
    orange: [{ r: 249, g: 115, b: 22 }, { r: 234, g: 88, b: 12 }],
    yellow: [{ r: 250, g: 204, b: 21 }, { r: 234, g: 179, b: 8 }],
    pink: [{ r: 236, g: 72, b: 153 }, { r: 219, g: 39, b: 119 }],
  };

  for (const [hint, colors] of Object.entries(colorHints)) {
    if (lowerDesc.includes(hint)) {
      return colors;
    }
  }

  // Generate colors based on seed
  const hue1 = rng.nextInt(0, 360);
  const hue2 = (hue1 + 30 + rng.nextInt(0, 60)) % 360;

  return [
    hslToRgb(hue1, 70 + rng.nextInt(0, 20), 50 + rng.nextInt(0, 15)),
    hslToRgb(hue2, 65 + rng.nextInt(0, 25), 45 + rng.nextInt(0, 20))
  ];
}

function hslToRgb(h: number, s: number, l: number): Color {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return {
    r: Math.round(255 * f(0)),
    g: Math.round(255 * f(8)),
    b: Math.round(255 * f(4))
  };
}

function generateShapes(rng: SeededRandom, description: string): Shape[] {
  const lowerDesc = description.toLowerCase();
  const shapes: Shape[] = [];

  // Detect shape hints
  const shapeCount = 2 + rng.nextInt(0, 2);

  for (let i = 0; i < shapeCount; i++) {
    const shapeType = rng.nextInt(0, 3);
    const size = BigInt(30 + rng.nextInt(0, 40));

    if (shapeType === 0) {
      shapes.push({ __kind__: 'circle', circle: size });
    } else if (shapeType === 1) {
      shapes.push({ __kind__: 'square', square: size });
    } else {
      shapes.push({ __kind__: 'triangle', triangle: size });
    }
  }

  return shapes;
}

function determineStyle(description: string): string {
  const lowerDesc = description.toLowerCase();

  if (lowerDesc.includes('modern') || lowerDesc.includes('minimal')) return 'modern';
  if (lowerDesc.includes('playful') || lowerDesc.includes('fun')) return 'playful';
  if (lowerDesc.includes('elegant') || lowerDesc.includes('luxury')) return 'elegant';
  if (lowerDesc.includes('tech') || lowerDesc.includes('futuristic')) return 'tech';
  if (lowerDesc.includes('organic') || lowerDesc.includes('natural')) return 'organic';

  return 'balanced';
}

export function generateLogoSpecification(description: string): GeneratedLogoResult {
  const seed = hashString(description);
  const rng = new SeededRandom(seed);

  const wordmark = extractWordmark(description);
  const colors = generateColors(rng, description);
  const shapes = generateShapes(rng, description);
  const style = determineStyle(description);

  const specification: LogoSpecification = {
    colors,
    shapes,
    style
  };

  return { specification, wordmark };
}
