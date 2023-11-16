import loadFonts from './loadFonts';

export default (height: number, bgColor: string) => `
  <style>
    body {
      width: 1200px;
      height: ${height}px;
      background-color: ${bgColor};
    }

    ${loadFonts()}
  </style>
`;
