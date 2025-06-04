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
      ],
      allowedAttributes: {
        a: ['href', 'target', 'rel'],
      },
    });
  }
  $: reRender(content);
</script>

{@html `
  <div class="markdown-component-content">
    ${rendered}
  </div>
`}
