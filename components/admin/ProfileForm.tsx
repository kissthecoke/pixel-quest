'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { saveProfile } from '@/app/admin/actions';
import type { Profile, Skill, Social } from '@/lib/types';
import { inputCls, labelCls, btn } from './ui';

const ICONS = [
  ['fa-brands fa-github', 'GitHub'], ['fa-brands fa-x-twitter', 'X'], ['fa-brands fa-instagram', 'Instagram'],
  ['fa-brands fa-youtube', 'YouTube'], ['fa-brands fa-linkedin', 'LinkedIn'], ['fa-brands fa-discord', 'Discord'],
  ['fa-brands fa-itch-io', 'itch.io'], ['fa-solid fa-link', '기타 링크']
];

export default function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [p, setP] = useState(profile);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [pending, start] = useTransition();
  const set = (k: keyof Profile, v: unknown) => setP((o) => ({ ...o, [k]: v }));
  const setSkill = (i: number, k: keyof Skill, v: string) => set('skills', p.skills.map((s, j) => (j === i ? { ...s, [k]: k === 'level' ? Number(v) : v } : s)));
  const setSocial = (i: number, k: keyof Social, v: string) => set('socials', p.socials.map((s, j) => (j === i ? { ...s, [k]: v } : s)));

  const save = () => start(async () => {
    const r = await saveProfile(p);
    setMsg(r.ok ? { ok: true, t: '프로필을 저장했어요' } : { ok: false, t: r.error ?? '저장 실패' });
    if (r.ok) router.refresh();
  });

  return (
    <div className="space-y-4">
      {msg && <div className={`p-3 border text-sm ${msg.ok ? 'bg-emerald-950 border-emerald-500 text-emerald-300' : 'bg-red-950 border-red-500 text-red-300'}`}>{msg.t}</div>}

      <section className="pixel-box bg-slate-900 p-4 space-y-4">
        <h2 className="font-title text-sm text-amber-400">CHARACTER · 기본 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label htmlFor="pn" className={labelCls}>NAME · 이름 (영문 추천)</label><input id="pn" value={p.name} onChange={(e) => set('name', e.target.value)} className={inputCls} /></div>
          <div><label htmlFor="pl" className={labelCls}>LOCATION · 미니맵 지명</label><input id="pl" value={p.location} onChange={(e) => set('location', e.target.value)} className={inputCls} /></div>
          <div><label htmlFor="pc" className={labelCls}>CLASS · 직업</label><input id="pc" value={p.class_label} onChange={(e) => set('class_label', e.target.value)} className={inputCls} /></div>
          <div><label htmlFor="pa" className={labelCls}>ALIGNMENT · 성향</label><input id="pa" value={p.alignment} onChange={(e) => set('alignment', e.target.value)} className={inputCls} /></div>
        </div>
        <div><label htmlFor="pb" className={labelCls}>BIO · 소개</label><textarea id="pb" rows={4} value={p.bio} onChange={(e) => set('bio', e.target.value)} className={inputCls} /></div>
      </section>

      <section className="pixel-box bg-slate-900 p-4 space-y-3">
        <h2 className="font-title text-sm text-cyan-400">SKILL_TREE · 스킬</h2>
        {p.skills.map((s, i) => (
          <div key={i} className="grid grid-cols-[minmax(0,1fr)_90px_40px] gap-2 items-center">
            <input value={s.name} onChange={(e) => setSkill(i, 'name', e.target.value)} className={inputCls} placeholder="스킬 이름" aria-label="스킬 이름" />
            <input type="number" min={0} max={99} value={s.level} onChange={(e) => setSkill(i, 'level', e.target.value)} className={inputCls} aria-label="레벨" />
            <button onClick={() => set('skills', p.skills.filter((_, j) => j !== i))} className="text-slate-500 hover:text-red-400" aria-label="스킬 삭제"><i className="fa-solid fa-xmark" /></button>
          </div>
        ))}
        <button onClick={() => set('skills', [...p.skills, { name: '', level: 50 }])} className={btn.ghost}><i className="fa-solid fa-plus" /> 스킬 추가</button>
      </section>

      <section className="pixel-box bg-slate-900 p-4 space-y-3">
        <h2 className="font-title text-sm text-pink-400">EQUIPPED_ITEMS · SNS 링크</h2>
        {p.socials.map((s, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-[150px_120px_minmax(0,1fr)_minmax(0,1fr)_40px] gap-2 items-center border-b border-slate-800 pb-3 md:border-0 md:pb-0">
            <select value={s.icon} onChange={(e) => setSocial(i, 'icon', e.target.value)} className={inputCls} aria-label="아이콘">
              {ICONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <input value={s.label} onChange={(e) => setSocial(i, 'label', e.target.value)} className={inputCls} placeholder="GITHUB" aria-label="표시 이름" />
            <input value={s.handle} onChange={(e) => setSocial(i, 'handle', e.target.value)} className={inputCls} placeholder="@아이디" aria-label="아이디" />
            <input value={s.url} onChange={(e) => setSocial(i, 'url', e.target.value)} className={inputCls} placeholder="https://..." aria-label="링크 주소" />
            <button onClick={() => set('socials', p.socials.filter((_, j) => j !== i))} className="text-slate-500 hover:text-red-400" aria-label="링크 삭제"><i className="fa-solid fa-xmark" /></button>
          </div>
        ))}
        <button onClick={() => set('socials', [...p.socials, { label: '', handle: '', url: 'https://', icon: 'fa-solid fa-link' }])} className={btn.ghost}><i className="fa-solid fa-plus" /> 링크 추가</button>
      </section>

      <button onClick={save} disabled={pending} className={btn.primary}>{pending ? 'SAVING...' : 'SAVE PROFILE'}</button>
    </div>
  );
}
