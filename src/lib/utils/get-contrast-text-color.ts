import hexToRgb from './hex-to-rgb';

export default function getContrastColor(forColor: string): 'black' | 'white' {
  const trimmed = forColor.trim();
  const isHex = trimmed.startsWith('#');

  let color: { r: number; g: number; b: number; a: number };

  if (isHex) {
    const converted = hexToRgb(trimmed);
    if (!converted) return 'white';

    color = { ...converted, a: 1 };
  } else {
    const [r, g, b, a] = trimmed
      .replace('rgba(', '')
      .replace('rgb(', '')
      .replace(')', '')
      .split(',')
      .map((v) => Number(v));

    color = { r, g, b, a };
  }

  const { r, g, b, a } = color;
  const brightness = r * 0.299 + g * 0.587 + b * 0.114 + (1 - a) * 255;

  return brightness > 186 ? 'black' : 'white';
}
