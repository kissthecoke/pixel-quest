'use client';
import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { savePost, deletePost, uploadImage, type PostInput } from '@/app/admin/actions';
import { renderMarkdown } from '@/lib/markdown';
import type { Category, Post } from '@/lib/types';
import { inputCls, labelCls, btn } from './ui';

const toLocal = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso); const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
};
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 100);

export default function PostEditor({ post, categories }: { post: Post | null; categories: Category[] }) {
  const router = useRouter();
  const [f, setF] = useState({
    title: post?.title ?? '', slug: post?.slug ?? '', summary: post?.summary ?? '', content: post?.content ?? '',
    icon: post?.icon ?? '🎮', category_id: post?.category_id ?? categories[0]?.id ?? '',
    published_at: toLocal(post?.published_at ?? null)
  });
  const [slugTouched, setSlugTouched] = useState(!!post);
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const ta = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof typeof f, v: string) => setF((o) => ({ ...o, [k]: v, ...(k === 'title' && !slugTouched ? { slug: slugify(v) } : {}) }));

  const insert = (before: string, after = '', placeholder = '') => {
    const el = ta.current; if (!el) return;
    const { selectionStart: a, selectionEnd: b, value } = el;
    const sel = value.slice(a, b) || placeholder;
    const next = value.slice(0, a) + before + sel + after + value.slice(b);
    setF((o) => ({ ...o, content: next }));
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(a + before.length, a + before.length + sel.length); });
  };

  const onUpload = async (file: File) => {
    setUploading(true);
    const fd = new FormData(); fd.append('file', file);
    const r = await uploadImage(fd);
    setUploading(false);
    if (!r.ok || !r.url) { setMsg({ ok: false, t: r.error ?? '업로드 실패' }); return; }
    insert(`\n![${file.name.replace(/\.[^.]+$/, '')}](${r.url})\n`);
  };

  const save = (status: 'draft' | 'published') => start(async () => {
    const input: PostInput = {
      id: post?.id, title: f.title, slug: f.slug, summary: f.summary, content: f.content, icon: f.icon,
      category_id: f.category_id || null, status,
      published_at: f.published_at ? new Date(f.published_at).toISOString() : null
    };
    const r = await savePost(input);
    if (!r.ok) { setMsg({ ok: false, t: r.error ?? '저장 실패' }); return; }
    setMsg({ ok: true, t: status === 'published' ? '발행했어요!' : '초안으로 저장했어요' });
    if (!post && r.id) router.replace(`/admin/posts/${r.id}`);
    router.refresh();
  });

  const remove = () => start(async () => {
    if (!post) return;
    const r = await deletePost(post.id);
    if (!r.ok) { setMsg({ ok: false, t: r.error ?? '삭제 실패' }); return; }
    router.replace('/admin/posts'); router.refresh();
  });

  const isLive = post?.status === 'published';
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-4 border-2 border-slate-700">
        <div>
          <h1 className="font-pixel text-sm text-amber-400">{post ? 'EDIT QUEST' : 'NEW QUEST'}</h1>
          <p className="text-sm text-slate-400 mt-1">
            {post ? (isLive ? '발행된 글이에요. 저장하면 바로 반영돼요.' : '초안이에요. 발행하기 전까지 방문자에게 안 보여요.') : '새 글을 써요'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isLive && <Link href={`/posts/${encodeURIComponent(post!.slug)}`} target="_blank" className={btn.ghost}><i className="fa-solid fa-eye" /> VIEW</Link>}
          <button onClick={() => save('draft')} disabled={pending} className={btn.ghost}>{isLive ? '발행 취소(초안으로)' : 'SAVE DRAFT'}</button>
          <button onClick={() => save('published')} disabled={pending} className={btn.primary}>{pending ? 'SAVING...' : isLive ? 'UPDATE' : 'PUBLISH'}</button>
        </div>
      </div>

      {msg && <div className={`p-3 border text-sm ${msg.ok ? 'bg-emerald-950 border-emerald-500 text-emerald-300' : 'bg-red-950 border-red-500 text-red-300'}`}>{msg.t}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-4">
        <div className="pixel-box bg-slate-900 p-4 space-y-4 min-w-0">
          <div>
            <label htmlFor="title" className={labelCls}>TITLE · 제목</label>
            <input id="title" value={f.title} maxLength={120} onChange={(e) => set('title', e.target.value)} className={`${inputCls} text-base`} placeholder="예: 픽셀 셰이더 공부 일지 1편" />
          </div>
          <div>
            <label htmlFor="summary" className={labelCls}>SUMMARY · 한 줄 요약</label>
            <input id="summary" value={f.summary} maxLength={300} onChange={(e) => set('summary', e.target.value)} className={inputCls} placeholder="목록에 보일 짧은 소개" />
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex gap-1">
                {(['write', 'preview'] as const).map((t) => (
                  <button key={t} onClick={() => setTab(t)} className={`font-pixel text-[9px] px-3 py-1.5 border-2 ${tab === t ? 'bg-amber-500 text-slate-950 border-amber-300' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                    {t === 'write' ? 'WRITE 쓰기' : 'PREVIEW 미리보기'}
                  </button>
                ))}
              </div>
              {tab === 'write' && (
                <div className="flex flex-wrap gap-1 text-sm">
                  {[
                    ['B', () => insert('**', '**', '굵게'), '굵게'],
                    ['H2', () => insert('\n## ', '', '제목'), '제목'],
                    ['H3', () => insert('\n### ', '', '소제목'), '소제목'],
                    ['•', () => insert('\n- ', '', '목록'), '목록'],
                    ['❝', () => insert('\n> ', '', '인용'), '인용'],
                    ['</>', () => insert('`', '`', 'code'), '코드'],
                    ['🔗', () => insert('[', '](https://)', '링크 글자'), '링크']
                  ].map(([l, fn, t]) => (
                    <button key={l as string} type="button" onClick={fn as () => void} title={t as string} className="bg-slate-800 border border-slate-600 px-2 py-1 hover:bg-slate-700 min-w-[34px]">{l as string}</button>
                  ))}
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="bg-slate-800 border border-slate-600 px-2 py-1 hover:bg-slate-700">
                    <i className="fa-solid fa-image" /> {uploading ? '올리는 중…' : '이미지'}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) onUpload(file); e.target.value = ''; }} />
                </div>
              )}
            </div>
            {tab === 'write' ? (
              <textarea ref={ta} id="content" value={f.content} onChange={(e) => set('content', e.target.value)} rows={18}
                className={`${inputCls} font-mono text-sm leading-relaxed`} placeholder={'빈 줄로 문단을 나눠요.\n\n## 제목\n- 목록\n**굵게**  `코드`  [링크](https://...)'} />
            ) : (
              <div className="bg-slate-950 border-2 border-slate-800 p-4 min-h-[300px]">
                <div className="post-body text-slate-200" dangerouslySetInnerHTML={{ __html: renderMarkdown(f.content) || '<p class="text-slate-500">내용이 없어요</p>' }} />
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="pixel-box bg-slate-900 p-4 space-y-4">
            <div>
              <label htmlFor="cat" className={labelCls}>CATEGORY</label>
              <select id="cat" value={f.category_id} onChange={(e) => set('category_id', e.target.value)} className={inputCls}>
                <option value="">미분류</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
              <Link href="/admin/categories" className="text-xs text-slate-500 hover:text-slate-300 mt-1 inline-block">+ 카테고리 관리</Link>
            </div>
            <div>
              <label htmlFor="icon" className={labelCls}>ICON · 이모지</label>
              <input id="icon" value={f.icon} maxLength={4} onChange={(e) => set('icon', e.target.value)} className={`${inputCls} text-center text-2xl`} />
            </div>
            <div>
              <label htmlFor="slug" className={labelCls}>URL · 글 주소</label>
              <input id="slug" value={f.slug} onChange={(e) => { setSlugTouched(true); set('slug', e.target.value); }} className={`${inputCls} text-sm`} />
              <p className="text-xs text-slate-500 mt-1 break-all">/posts/{slugify(f.slug || f.title) || '...'}</p>
            </div>
            <div>
              <label htmlFor="pub" className={labelCls}>PUBLISH AT · 발행 시각</label>
              <input id="pub" type="datetime-local" value={f.published_at} onChange={(e) => set('published_at', e.target.value)} className={`${inputCls} text-sm`} />
              <p className="text-xs text-slate-500 mt-1">비워 두면 발행하는 순간으로 정해져요. 미래 시각이면 그때 공개돼요.</p>
            </div>
          </div>

          {post && (
            <div className="pixel-box bg-slate-900 p-4 space-y-2">
              <p className="text-xs text-slate-500">좋아요 {post.likes} · 마지막 수정 {post.updated_at.slice(0, 10)}</p>
              {confirmDel ? (
                <div className="space-y-2">
                  <p className="text-sm text-red-300">정말 이 글을 지울까요? 되돌릴 수 없어요.</p>
                  <div className="flex gap-2">
                    <button onClick={remove} disabled={pending} className={btn.danger}>삭제</button>
                    <button onClick={() => setConfirmDel(false)} className={btn.ghost}>취소</button>
                  </div>
                </div>
              ) : <button onClick={() => setConfirmDel(true)} className={`${btn.danger} w-full`}><i className="fa-solid fa-trash" /> DELETE</button>}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
