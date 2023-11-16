import loadFonts from './loadFonts';

export default async (height: number, bgColor: string, fetch: typeof window.fetch) => `
  <style>
    body {
      width: 1200px;
      height: ${height}px;
      background-color: ${bgColor};
    }

    ${await loadFonts(fetch)}
  </style>
`;
