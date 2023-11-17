// Adjusted from https://github.com/junminahn/node-font2base64/tree/main

const _toDataUrl = (mediaType: string, base64: string) =>
  `data:${mediaType};charset=utf-8;base64,${base64}`;

export const toDataUrl = (base64: string) => {
  const meta = {
    mediaType: 'application/font-woff2',
    format: 'woff2',
  };

  const mediaType = meta.mediaType;
  return _toDataUrl(mediaType, base64);
};
