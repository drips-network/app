import sanitize from 'sanitize-html';
import twemoji from 'twemoji';
import { BASE_URL } from './base-url';

export default (...args: Parameters<typeof twemoji.parse>) => {
  const options = args[1] || {};

  return twemoji.parse(sanitize(args[0].toString()), {
    ...options,
    base: BASE_URL,
    folder: '/twemoji',
    ext: '.svg',
  });
};
