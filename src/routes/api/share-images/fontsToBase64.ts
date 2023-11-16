// Adjusted from https://github.com/junminahn/node-font2base64/tree/main

import * as fs from 'fs';
import { fileTypeFromBuffer } from 'file-type';
import assert from '$lib/utils/assert';

const _toDataUrl = (mediaType: string, base64: string) =>
  `data:${mediaType};charset=utf-8;base64,${base64}`;

const toDataUrl = (fpath: string, base64: string) => {
  const meta = {
    mediaType: 'application/font-woff2',
    format: 'woff2',
  };

  const mediaType = meta.mediaType;
  return _toDataUrl(mediaType, base64);
};

const readBuffer = async (buff: Buffer) => {
  const base64 = buff.toString('base64');

  const data = await fileTypeFromBuffer(buff);
  assert(data);

  return base64;
};

export const encodeToDataUrl = async (fpath: string) => {
  const buff = fs.readFileSync(fpath);
  const data = await readBuffer(buff);

  return toDataUrl(fpath, data);
};
