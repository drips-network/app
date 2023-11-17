import fetchFont from './fetchFontBase64';

export default async function (fetch: typeof window.fetch) {
  const redactionFontData = await fetchFont('/fonts/redaction/Redaction_50-Italic.woff2', fetch);

  const interFontData = await fetchFont('/fonts/Inter-Regular.woff2', fetch);

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
