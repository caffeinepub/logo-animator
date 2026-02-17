import type { LogoSpecification, Color, Shape } from '../backend';

function colorToHex(color: Color): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

function renderAnimatedShape(shape: Shape, x: number, y: number, color: string, index: number, speed: number): string {
  const delay = index * 0.15 / speed;
  const duration = 2 / speed;

  if (shape.__kind__ === 'circle') {
    const r = Number(shape.circle);
    return `
      <circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="0">
        <animate attributeName="opacity" from="0" to="0.9" begin="${delay}s" dur="${duration}s" fill="freeze"/>
        <animate attributeName="r" from="0" to="${r}" begin="${delay}s" dur="${duration}s" fill="freeze"/>
      </circle>
    `;
  } else if (shape.__kind__ === 'square') {
    const size = Number(shape.square);
    const rotation = index * 15;
    return `
      <rect x="${x - size / 2}" y="${y - size / 2}" width="${size}" height="${size}" fill="${color}" opacity="0" transform="rotate(${rotation} ${x} ${y})">
        <animate attributeName="opacity" from="0" to="0.85" begin="${delay}s" dur="${duration}s" fill="freeze"/>
        <animateTransform 
          attributeName="transform" 
          type="scale" 
          from="0" 
          to="1" 
          begin="${delay}s" 
          dur="${duration}s" 
          additive="sum"
          fill="freeze"
        />
      </rect>
    `;
  } else {
    const size = Number(shape.triangle);
    const h = size * 0.866;
    const points = `${x},${y - h / 2} ${x - size / 2},${y + h / 2} ${x + size / 2},${y + h / 2}`;
    return `
      <polygon points="${points}" fill="${color}" opacity="0">
        <animate attributeName="opacity" from="0" to="0.9" begin="${delay}s" dur="${duration}s" fill="freeze"/>
        <animateTransform 
          attributeName="transform" 
          type="scale" 
          from="0" 
          to="1" 
          begin="${delay}s" 
          dur="${duration}s" 
          additive="sum"
          fill="freeze"
        />
      </polygon>
    `;
  }
}

export function renderAnimatedSvg(spec: LogoSpecification, wordmark: string, speed: number = 1): string {
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
    shapesMarkup += renderAnimatedShape(shape, x, y, colors[colorIndex], index, speed);
  });

  const fontSize = Math.max(24, Math.min(48, 400 / wordmark.length));
  const textY = centerY + 100;
  const textDelay = (spec.shapes.length * 0.15 + 0.2) / speed;
  const textDuration = 1 / speed;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <filter id="shadow-animated">
          <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.15"/>
        </filter>
      </defs>
      <rect width="${width}" height="${height}" fill="transparent"/>
      <g filter="url(#shadow-animated)">
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
        opacity="0"
      >
        ${wordmark}
        <animate attributeName="opacity" from="0" to="1" begin="${textDelay}s" dur="${textDuration}s" fill="freeze"/>
      </text>
    </svg>
  `.trim();
}
