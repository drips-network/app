<script lang="ts">
  import { marked } from 'marked';
  import sanitize from 'sanitize-html';
  import './markdown.css';

  export let content: string;

  let rendered: string | null = null;

  marked.use({
    renderer: {
      link({ href, text }) {
        return `<a href="${href}" target="_blank" rel="noreferrer">${text}</a>`;
      },
    },
  });

  async function reRender(content: string) {
    const markup = await marked(content);

    rendered = sanitize(markup, {
      allowedTags: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'p',
        'strong',
        'em',
        'a',
        'ul',
        'ol',
        'li',
        'blockquote',
        'code',
        's',
        'del',
        'hr',
        'br',
        'pre',
        'input',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        'img',
        'div',
        'span',
        'sup',
        'sub',
        'details',
      ],
      allowedAttributes: {
        a: ['href', 'target', 'rel'],
        img: ['src', 'alt', 'title', 'width', 'height'],
        input: ['type', 'checked', 'disabled'],
      },
    });
  }
  $: reRender(content);
</script>

<div class="markdown">
  {@html `
    <div class="markdown-component-content">
    ${rendered ?? ''}
    </div>
  `}
</div>

<style>
  .markdown {
    width: 100%;
    overflow: hidden;
    position: relative;
  }
</style>
