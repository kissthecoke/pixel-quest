// 아주 작은 마크다운 변환기. HTML 태그는 모두 글자로 바꿔서(이스케이프) 안전하게 보여줌.
// 지원: ## 제목, ### 소제목, - 목록, 1. 목록, > 인용, ``` 코드 블록, ![설명](이미지주소), [글자](링크), **굵게**, *기울임*, `코드`

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const safeUrl = (u: string) => (/^(https?:\/\/|\/)/i.test(u.trim()) ? u.trim() : '#');

function inline(text: string): string {
  let s = esc(text);
  const codes: string[] = [];
  s = s.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, url) =>
    `<img src="${safeUrl(url)}" alt="${alt}" loading="lazy" class="post-img">`);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, url) =>
    `<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer">${t}</a>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[+i]}</code>`);
  return s;
}

export function renderMarkdown(src: string): string {
  const lines = (src || '').replace(/\r\n?/g, '\n').split('\n');
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    if (line.startsWith('```')) {
      const buf: string[] = []; i++;
      while (i < lines.length && !lines[i].startsWith('```')) buf.push(lines[i++]);
      i++;
      out.push(`<pre><code>${esc(buf.join('\n'))}</code></pre>`);
      continue;
    }
    const h = /^(#{2,3})\s+(.*)$/.exec(line) || /^(#)\s+(.*)$/.exec(line);
    if (h) { const lv = h[1].length === 3 ? 3 : 2; out.push(`<h${lv}>${inline(h[2])}</h${lv}>`); i++; continue; }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) items.push(`<li>${inline(lines[i++].replace(/^\s*[-*]\s+/, ''))}</li>`);
      out.push(`<ul>${items.join('')}</ul>`); continue;
    }
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) items.push(`<li>${inline(lines[i++].replace(/^\s*\d+[.)]\s+/, ''))}</li>`);
      out.push(`<ol>${items.join('')}</ol>`); continue;
    }
    if (line.startsWith('>')) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) buf.push(inline(lines[i++].replace(/^>\s?/, '')));
      out.push(`<blockquote>${buf.join('<br>')}</blockquote>`); continue;
    }
    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(```|#{1,3}\s|\s*[-*]\s+|\s*\d+[.)]\s+|>)/.test(lines[i])) buf.push(inline(lines[i++]));
    out.push(`<p>${buf.join('<br>')}</p>`);
  }
  return out.join('\n');
}
