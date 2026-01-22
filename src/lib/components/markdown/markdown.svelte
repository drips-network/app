<script lang="ts">
  import { marked } from 'marked';
  import sanitize from 'sanitize-html';
  import './markdown.css';
  import { browser } from '$app/environment';
  import buildExternalUrl from '$lib/utils/build-external-url';

  interface Props {
    content: string;
    useExternalRoute?: boolean;
    lineClamp?: number;
  }

  let { content, lineClamp, useExternalRoute = true }: Props = $props();

  marked.use({
    renderer: {
      link({ href, text }) {
        const isDripsDomain = (url: string) => {
          try {
            const parsedUrl = new URL(url, browser ? window.location.origin : undefined);
            return parsedUrl.hostname.endsWith('drips.network');
          } catch {
            return false;
          }
        };

        const url = isDripsDomain(href) || !useExternalRoute ? href : buildExternalUrl(href);

        return `<a href="${url}" target="_blank" rel="noreferrer">${text}</a>`;
      },
    },
  });

  function reRender(content: string): string {
    const markup = marked(content, { breaks: true }) as string;

    return sanitize(markup, {
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

  let rendered = $derived(reRender(content));
</script>

<div class="markdown {lineClamp ? `line-clamp-${lineClamp}` : ''}">
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
