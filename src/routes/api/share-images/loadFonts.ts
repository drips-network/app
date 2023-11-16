import font2base64 from 'node-font2base64';

export default function () {
  const redactionFontData = font2base64.encodeToDataUrlSync(
    './static/fonts/redaction/Redaction_50-Italic.woff2',
  );
  const interFontData = font2base64.encodeToDataUrlSync('./static/fonts/Inter-Regular.woff2');

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
