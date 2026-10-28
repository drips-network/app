import { describe, expect, it } from 'vitest';
import { assertAvatarImageHeader } from './read-avatar-image';

/** A PNG signature and IHDR chunk claiming the given dimensions, with no pixel data. */
function pngHeader(width: number, height: number) {
  const ihdr = Buffer.alloc(25);
  ihdr.writeUInt32BE(13, 0);
  ihdr.write('IHDR', 4, 'ascii');
  ihdr.writeUInt32BE(width, 8);
  ihdr.writeUInt32BE(height, 12);
  ihdr.writeUInt8(8, 16); // bit depth
  ihdr.writeUInt8(6, 17); // RGBA

  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), ihdr]);
}

/** A JPEG SOI marker, JFIF APP0 segment and SOF0 segment claiming the given dimensions, with no scan data. */
function jpegHeader(width: number, height: number) {
  const sof = Buffer.from([
    0xff, 0xc0, 0x00, 0x11, 0x08, 0, 0, 0, 0, 0x03, 0x01, 0x22, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11,
    0x01,
  ]);
  sof.writeUInt16BE(height, 5);
  sof.writeUInt16BE(width, 7);

  const app0 = Buffer.from([
    0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01,
    0x00, 0x00,
  ]);

  return Buffer.concat([Buffer.from([0xff, 0xd8]), app0, sof]);
}

function getMessage(fn: () => void) {
  try {
    fn();
  } catch (e) {
    return (e as { body: { message: string } }).body.message;
  }
}

describe('assertAvatarImageHeader', () => {
  it('accepts reasonably sized PNGs and JPEGs', () => {
    expect(() => assertAvatarImageHeader(pngHeader(1000, 1000))).not.toThrow();
    expect(() => assertAvatarImageHeader(jpegHeader(4032, 3024))).not.toThrow();
  });

  it('rejects images whose header claims too many pixels', () => {
    expect(getMessage(() => assertAvatarImageHeader(pngHeader(50_000, 50_000)))).toBe(
      'Image dimensions too large',
    );
    expect(getMessage(() => assertAvatarImageHeader(jpegHeader(65_000, 65_000)))).toBe(
      'Image dimensions too large',
    );
  });

  it('rejects formats other than PNG and JPEG', () => {
    const gif = Buffer.from('GIF89a\x08\x00\x08\x00', 'binary');

    expect(getMessage(() => assertAvatarImageHeader(gif))).toBe('Invalid image format');
  });

  it('rejects garbage', () => {
    expect(getMessage(() => assertAvatarImageHeader(Buffer.from('not an image')))).toBe(
      'Invalid image',
    );
  });
});
