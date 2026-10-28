import { Marked } from 'marked';
import sanitize from 'sanitize-html';

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Dedicated instance so the custom renderer doesn't leak into the global `marked`.
const titleMarked = new Marked({
  async: false,
  renderer: {
    codespan({ text }) {
      // Codespan `text` is raw, not escaped by marked (its default renderer escapes it).
      return `<code class="issue-title-code">${escapeHtml(text)}</code>`;
    },
  },
});

/**
 * Render a (user-controlled) GitHub issue title, turning backtick spans into
 * `<code>` elements. Everything except `<code class="issue-title-code">` is
 * stripped. Styles for `.issue-title-code` live in src/styles/global.css.
 */
export function renderIssueTitle(title: string): string {
  const markup = titleMarked.parse(title, { async: false });

  return sanitize(markup, {
    allowedTags: ['code'],
    allowedAttributes: {
      code: ['class'],
    },
    allowedClasses: {
      code: ['issue-title-code'],
    },
  });
}
