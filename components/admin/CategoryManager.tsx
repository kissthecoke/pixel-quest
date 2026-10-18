'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { saveCategory, deleteCategory, reorderCategories } from '@/app/admin/actions';
import { CATEGORY_COLORS, colorOf, type ColorKey } from '@/lib/colors';
import type { Category } from '@/lib/types';
import { inputCls, labelCls, btn } from './ui';

type Row = { id?: string; name: string; slug: string; color: string; icon: string; sort_order: number };

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="색상">
      {(Object.keys(CATEGORY_COLORS) as ColorKey[]).map((k) => (
        <button key={k} type="button" role="radio" aria-checked={value === k} title={CATEGORY_COLORS[k].label} onClick={() => onChange(k)}
          className={`w-7 h-7 border-2 ${CATEGORY_COLORS[k].swatch} ${value === k ? 'border-white scale-110' : 'border-slate-900'}`} />
      ))}
    </div>
  );
}

function Editor({ row, count, onDone, onCancel }: { row: Row; count?: number; onDone: (msg: string) => void; onCancel?: () => void }) {
  const router = useRouter();
  const [r, setR] = useState(row);
  const [err, setErr] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  const set = (k: keyof Row, v: string | number) => setR((o) => ({ ...o, [k]: v }));

  const save = () => start(async () => {
    const res = await saveCategory(r);
    if (!res.ok) { setErr(res.error ?? '저장 실패'); return; }
    setErr(''); onDone(`'${r.name}' 저장했어요`); router.refresh();
  });
  const remove = () => start(async () => {
    const res = await deleteCategory(r.id!);
    if (!res.ok) { setErr(res.error ?? '삭제 실패'); return; }
    onDone(`'${r.name}' 삭제했어요`); router.refresh();
  });

  const col = colorOf(r.color);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-[70px_minmax(0,1fr)_minmax(0,1fr)] gap-3">
        <div>
          <label className={labelCls}>ICON</label>
          <input value={r.icon} maxLength={4} onChange={(e) => set('icon', e.target.value)} className={`${inputCls} text-center text-xl`} aria-label="아이콘" />
        </div>
        <div>
          <label className={labelCls}>NAME · 이름</label>
          <input value={r.name} maxLength={30} onChange={(e) => set('name', e.target.value)} className={inputCls} placeholder="예: 게임 리뷰" aria-label="이름" />
        </div>
        <div>
          <label className={labelCls}>SLUG · 주소 (영문)</label>
          <input value={r.slug} maxLength={40} onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} className={inputCls} placeholder="game-review" aria-label="주소" />
        </div>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <label className={labelCls}>COLOR</label>
          <ColorPicker value={r.color} onChange={(c) => set('color', c)} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">미리보기</span>
          <span className={`font-pixel text-[10px] px-2 py-0.5 border ${col.badge}`}>{(r.slug || 'slug').toUpperCase()}</span>
          <span className={`bg-slate-800 border border-slate-600 p-2 text-sm ${col.text}`}>[{r.icon}] {r.name || '이름'}</span>
        </div>
      </div>
      {err && <p className="text-sm text-red-400">{err}</p>}
      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={save} disabled={pending} className={btn.primary}>{r.id ? 'SAVE' : 'ADD'}</button>
        {onCancel && <button onClick={onCancel} className={btn.ghost}>CANCEL</button>}
        {r.id && (confirm ? (
          <span className="flex flex-wrap items-center gap-2 text-sm text-red-300 ml-auto">
            {count ? `글 ${count}개가 미분류가 돼요.` : ''} 지울까요?
            <button onClick={remove} disabled={pending} className={btn.danger}>삭제</button>
            <button onClick={() => setConfirm(false)} className={btn.ghost}>취소</button>
          </span>
        ) : <button onClick={() => setConfirm(true)} className={`${btn.danger} ml-auto`}><i className="fa-solid fa-trash" /></button>)}
      </div>
    </div>
  );
}

export default function CategoryManager({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [note, setNote] = useState('');
  const [pending, start] = useTransition();

  const move = (i: number, d: number) => start(async () => {
    const ids = categories.map((c) => c.id);
    const j = i + d; if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    const r = await reorderCategories(ids);
    setNote(r.ok ? '순서를 바꿨어요' : r.error ?? '실패'); router.refresh();
  });

  return (
    <div className="space-y-4">
      {note && <div className="p-3 border text-sm bg-slate-900 border-slate-600 text-slate-200">{note}</div>}
      <div className="space-y-3">
        {categories.map((c, i) => (
          <div key={c.id} className="pixel-box bg-slate-900 p-4">
            {editing === c.id ? (
              <Editor row={c} count={counts[c.id]} onDone={(m) => { setNote(m); setEditing(null); }} onCancel={() => setEditing(null)} />
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-col">
                  <button onClick={() => move(i, -1)} disabled={pending || i === 0} className="text-slate-400 hover:text-white disabled:opacity-20 text-xs px-1" aria-label="위로">▲</button>
                  <button onClick={() => move(i, 1)} disabled={pending || i === categories.length - 1} className="text-slate-400 hover:text-white disabled:opacity-20 text-xs px-1" aria-label="아래로">▼</button>
                </div>
                <span className="text-2xl">{c.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className={`font-bold ${colorOf(c.color).text}`}>{c.name}</p>
                  <p className="font-term text-base text-slate-500">/?cat={c.slug} · 글 {counts[c.id] ?? 0}개</p>
                </div>
                <span className={`font-pixel text-[10px] px-2 py-0.5 border ${colorOf(c.color).badge}`}>{c.slug.toUpperCase()}</span>
                <button onClick={() => { setEditing(c.id); setAdding(false); }} className={btn.ghost}><i className="fa-solid fa-pen" /> EDIT</button>
              </div>
            )}
          </div>
        ))}
        {!categories.length && <p className="text-sm text-slate-500">카테고리가 없어요. 첫 카테고리를 만들어 보세요.</p>}
      </div>

      {adding ? (
        <div className="pixel-box bg-slate-900 border-emerald-600 p-4">
          <h2 className="font-title text-sm text-emerald-400 mb-3">NEW CATEGORY</h2>
          <Editor row={{ name: '', slug: '', color: 'amber', icon: '🎮', sort_order: categories.length + 1 }}
            onDone={(m) => { setNote(m); setAdding(false); }} onCancel={() => setAdding(false)} />
        </div>
      ) : (
        <button onClick={() => { setAdding(true); setEditing(null); }} className={btn.primary}><i className="fa-solid fa-plus" /> 카테고리 추가</button>
      )}
    </div>
  );
}
