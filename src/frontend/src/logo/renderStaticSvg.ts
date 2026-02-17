import type { LogoSpecification, Color, Shape } from '../backend';

function colorToHex(color: Color): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

function renderShape(shape: Shape, x: number, y: number, color: string, index: number): string {
  if (shape.__kind__ === 'circle') {
    const r = Number(shape.circle);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="0.9"/>`;
  } else if (shape.__kind__ === 'square') {
    const size = Number(shape.square);
    const rotation = index * 15;
    return `<rect x="${x - size / 2}" y="${y - size / 2}" width="${size}" height="${size}" fill="${color}" opacity="0.85" transform="rotate(${rotation} ${x} ${y})"/>`;
  } else {
    const size = Number(shape.triangle);
    const h = size * 0.866;
    const points = `${x},${y - h / 2} ${x - size / 2},${y + h / 2} ${x + size / 2},${y + h / 2}`;
    return `<polygon points="${points}" fill="${color}" opacity="0.9"/>`;
  }
}

export function renderStaticSvg(spec: LogoSpecification, wordmark: string): string {
  const width = 400;
  const height = 400;
  const centerX = width / 2;
  const centerY = height / 2 - 20;

  const colors = spec.colors.map(colorToHex);
  
  let shapesMarkup = '';
  spec.shapes.forEach((shape, index) => {
    const angle = (index / spec.shapes.length) * Math.PI * 2;
    const radius = 60;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    const colorIndex = index % colors.length;
    shapesMarkup += renderShape(shape, x, y, colors[colorIndex], index);
  });

  const fontSize = Math.max(24, Math.min(48, 400 / wordmark.length));
  const textY = centerY + 100;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <filter id="shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.15"/>
        </filter>
      </defs>
      <rect width="${width}" height="${height}" fill="transparent"/>
      <g filter="url(#shadow)">
        ${shapesMarkup}
      </g>
      <text 
        x="${centerX}" 
        y="${textY}" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="${fontSize}" 
        font-weight="700" 
        fill="${colors[0]}" 
        text-anchor="middle"
        letter-spacing="0.5"
      >
        ${wordmark}
      </text>
    </svg>
  `.trim();
}
