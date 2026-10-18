'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteScore } from '@/app/admin/actions';
import type { Score } from '@/lib/types';
import { btn } from './ui';

export default function ScoreTable({ scores }: { scores: Score[] }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState<number | null>(null);
  const [err, setErr] = useState('');
  const [pending, start] = useTransition();
  const remove = (id: number) => start(async () => {
    const r = await deleteScore(id); setErr(r.ok ? '' : r.error ?? '실패'); setConfirm(null); router.refresh();
  });

  return (
    <div className="pixel-box bg-slate-900 overflow-x-auto">
      {err && <p className="text-sm text-red-400 p-3">{err}</p>}
      <table className="w-full text-sm min-w-[520px]">
        <thead>
          <tr className="text-left font-pixel text-[8px] text-slate-500 border-b-2 border-slate-800">
            <th className="p-3">RANK</th><th className="p-3">NICKNAME</th><th className="p-3 text-right">SCORE</th><th className="p-3 text-right">COIN</th><th className="p-3">DATE</th><th className="p-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {scores.map((s, i) => (
            <tr key={s.id} className="hover:bg-slate-800/50">
              <td className={`p-3 font-pixel text-[10px] ${i < 10 ? 'text-amber-400' : 'text-slate-500'}`}>{i + 1}</td>
              <td className="p-3 font-pixel text-[10px] uppercase">{s.nickname}</td>
              <td className="p-3 text-right font-term text-lg text-amber-300 tabular-nums">{s.score}</td>
              <td className="p-3 text-right font-term text-lg text-slate-400">{s.coins}</td>
              <td className="p-3 font-term text-base text-slate-400">{new Date(s.created_at).toLocaleString('ko-KR')}</td>
              <td className="p-3 text-right">
                {confirm === s.id ? (
                  <span className="inline-flex gap-1">
                    <button onClick={() => remove(s.id)} disabled={pending} className={btn.danger}>삭제</button>
                    <button onClick={() => setConfirm(null)} className={btn.ghost}>취소</button>
                  </span>
                ) : <button onClick={() => setConfirm(s.id)} className={btn.ghost} aria-label="기록 삭제"><i className="fa-solid fa-trash" /></button>}
              </td>
            </tr>
          ))}
          {!scores.length && <tr><td colSpan={6} className="p-6 text-center text-slate-500">아직 기록이 없어요.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
