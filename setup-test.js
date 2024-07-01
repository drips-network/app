import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

class ESBuildAndJSDOMCompatibleTextEncoder extends TextEncoder {
  constructor() {
    super();
  }

  encode(input) {
    if (typeof input !== 'string') {
      throw new TypeError('`input` must be a string');
    }

    const decodedURI = decodeURIComponent(encodeURIComponent(input));
    const arr = new Uint8Array(decodedURI.length);
    const chars = decodedURI.split('');
    for (let i = 0; i < chars.length; i++) {
      arr[i] = decodedURI[i].charCodeAt(0);
    }
    return arr;
  }
}

Object.defineProperty(global, 'TextEncoder', {
  value: ESBuildAndJSDOMCompatibleTextEncoder,
  writable: true,
});
