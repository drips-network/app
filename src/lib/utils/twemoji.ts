import sanitize from 'sanitize-html';
import twemoji from 'twemoji';

export default (...args: Parameters<typeof twemoji.parse>) => {
  const options = args[1] || {};

  return twemoji.parse(sanitize(args[0].toString()), {
    ...options,
    folder: '/twemoji',
    ext: '.svg',
    base: '',
  });
};
