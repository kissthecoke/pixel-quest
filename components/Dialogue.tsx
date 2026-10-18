'use client';
import { useEffect, useRef, useState } from 'react';
import { useRetro } from './RetroProvider';

/** 게임 대화창처럼 글자가 한 자씩 찍히는 본문. 클릭하면 바로 전체 표시 */
export default function Dialogue({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [typing, setTyping] = useState(true);
  const skip = useRef<() => void>(() => {});
  const { play } = useRetro();

  useEffect(() => {
    const root = ref.current; if (!root) return;
    root.innerHTML = html;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setTyping(false); return; }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes: { node: Text; text: string }[] = [];
    while (walker.nextNode()) { const n = walker.currentNode as Text; nodes.push({ node: n, text: n.data }); n.data = ''; }
    const media = Array.from(root.querySelectorAll('img')) as HTMLElement[];
    media.forEach((m) => (m.style.visibility = 'hidden'));
    const caret = document.createElement('span'); caret.className = 'caret';

    let ni = 0, ci = 0, count = 0;
    const done = () => {
      clearInterval(timer);
      nodes.forEach(({ node, text }) => (node.data = text));
      media.forEach((m) => (m.style.visibility = ''));
      caret.remove(); setTyping(false);
    };
    skip.current = done;
    const timer = setInterval(() => {
      for (let k = 0; k < 2; k++) {
        if (ni >= nodes.length) return done();
        const cur = nodes[ni];
        ci++; cur.node.data = cur.text.slice(0, ci);
        cur.node.after(caret);
        if (ci >= cur.text.length) {
          // 이 텍스트 앞의 이미지 공개
          media.forEach((m) => { if (m.compareDocumentPosition(cur.node) & Node.DOCUMENT_POSITION_FOLLOWING) m.style.visibility = ''; });
          ni++; ci = 0;
        }
      }
      if (++count % 3 === 0) play('type');
    }, 22);
    return () => clearInterval(timer);
  }, [html, play]);

  return (
    <div onClick={() => typing && skip.current()} className={typing ? 'cursor-pointer' : ''}>
      <div ref={ref} className="post-body text-slate-200 text-base pt-4 border-t border-slate-800 max-w-[68ch]" />
      {typing && <p className="font-pixel text-[8px] text-slate-500 text-right mt-3">CLICK ▼ SKIP</p>}
    </div>
  );
}
