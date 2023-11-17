import fetchFont from './fetchFontBase64';

export default async function (fetch: typeof window.fetch) {
  const redactionFontData = await fetchFont('/fonts/redaction/Redaction_50-Italic.otf', fetch);

  const interFontData = await fetchFont('/fonts/Inter-Regular.woff', fetch);

  return [
    {
      name: 'Inter',
      data: interFontData,
    },
    {
      name: 'Redaction',
      data: redactionFontData,
    },
  ];
}
