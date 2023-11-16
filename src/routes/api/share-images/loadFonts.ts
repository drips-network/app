import { encodeToDataUrl } from './fontsToBase64';

export default async function () {
  const redactionFontData = await encodeToDataUrl(
    './static/fonts/redaction/Redaction_50-Italic.woff2',
  );
  const interFontData = await encodeToDataUrl('./static/fonts/Inter-Regular.woff2');

  return `
  @font-face {
    font-family: 'Redaction';
    src: url(${redactionFontData}) format('woff2');
  }
  @font-face {
    font-family: 'Inter';
    src: url(${interFontData}) format('woff2');
  }`;
}
