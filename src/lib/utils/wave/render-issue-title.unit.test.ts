import { marked } from 'marked';
import { describe, expect, it } from 'vitest';
import { renderIssueTitle as render } from './render-issue-title';

// marked wraps the title in a <p>, which is stripped, leaving a trailing newline.
const renderIssueTitle = (title: string) => render(title).trim();

describe('renderIssueTitle', () => {
  it('renders backtick spans as code with the fixed class', () => {
    expect(renderIssueTitle('Fix `foo()` crash')).toBe(
      'Fix <code class="issue-title-code">foo()</code> crash',
    );
  });

  it('escapes HTML inside backtick spans', () => {
    expect(renderIssueTitle('`<img src=x onerror=alert(1)>`')).toBe(
      '<code class="issue-title-code">&lt;img src=x onerror=alert(1)&gt;</code>',
    );
  });

  it('does not double-escape entities inside backtick spans', () => {
    expect(renderIssueTitle('`a && b`')).toBe(
      '<code class="issue-title-code">a &amp;&amp; b</code>',
    );
  });

  it('strips style attributes from raw code tags', () => {
    const out = renderIssueTitle(
      'Fix <code style="position:fixed;inset:0;z-index:9999;background:url(https://attacker/px)">Account suspended</code>',
    );

    expect(out).toBe('Fix <code>Account suspended</code>');
    expect(out).not.toContain('style');
    expect(out).not.toContain('attacker');
  });

  it('strips arbitrary classes from raw code tags', () => {
    expect(renderIssueTitle('<code class="fixed inset-0 issue-title-code">x</code>')).toBe(
      '<code class="issue-title-code">x</code>',
    );
    expect(renderIssueTitle('<code class="fixed inset-0">x</code>')).toBe('<code>x</code>');
  });

  it('strips other attributes from raw code tags', () => {
    expect(renderIssueTitle('<code id="a" onclick="alert(1)" data-x="y">x</code>')).toBe(
      '<code>x</code>',
    );
  });

  it('strips img, a, script and other tags', () => {
    const out = renderIssueTitle(
      'a <img src="https://attacker/px"> b <a href="https://evil">link</a> <script>alert(1)</script> <span class="x">s</span> [md](https://evil) ![i](https://attacker/px)',
    );

    expect(out).not.toMatch(/<(img|a|script|span)\b/);
    expect(out).not.toContain('attacker');
    expect(out).not.toContain('alert(1)');
  });

  it('escapes plain text with < and &', () => {
    expect(renderIssueTitle('a < b & c')).toBe('a &lt; b &amp; c');
  });

  it('does not modify the global marked instance', () => {
    renderIssueTitle('`x`');

    expect(marked.parseInline('`x`')).toBe('<code>x</code>');
  });
});
