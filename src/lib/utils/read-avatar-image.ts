import { error } from '@sveltejs/kit';
import { imageSize } from 'image-size';
import { Jimp } from 'jimp';

// Decoded images take 4 bytes per pixel, so a small but highly compressible file can
// expand to gigabytes in memory. Cap the pixel count before handing anything to Jimp.
// 25 MP (~100 MB decoded) is far more than any avatar needs.
const MAX_PIXELS = 25_000_000;

const ALLOWED_TYPES = ['png', 'jpg'];

/**
 * Check a user-supplied image's format and dimensions from its header alone, without
 * decoding it. Throws a 400 for anything that isn't a reasonably sized PNG or JPEG.
 */
export function assertAvatarImageHeader(buffer: Uint8Array) {
  let dimensions: ReturnType<typeof imageSize>;

  try {
    dimensions = imageSize(buffer);
  } catch {
    throw error(400, 'Invalid image');
  }

  const { type, width, height } = dimensions;

  if (!type || !ALLOWED_TYPES.includes(type)) {
    throw error(400, 'Invalid image format');
  }

  if (!width || !height || width * height > MAX_PIXELS) {
    throw error(400, 'Image dimensions too large');
  }
}

/**
 * Read a user-supplied PNG or JPEG into Jimp, rejecting other formats and oversized
 * images before they're decoded.
 */
export default async function readAvatarImage(buffer: Buffer) {
  assertAvatarImageHeader(buffer);

  try {
    return await Jimp.read(buffer);
  } catch {
    throw error(400, 'Invalid image');
  }
}
