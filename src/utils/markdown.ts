import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

const md = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true,
  highlight(str: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre><code class="hljs language-${lang}">${hljs.highlight(str, { language: lang }).value}</code></pre>`
      } catch {
        // fall through to auto-detection
      }
    }
    // Auto-detect language
    try {
      return `<pre><code class="hljs">${hljs.highlightAuto(str).value}</code></pre>`
    } catch {
      return `<pre><code>${md.utils.escapeHtml(str)}</code></pre>`
    }
  },
})

export function renderMarkdown(text: string): string {
  return md.render(text)
}
