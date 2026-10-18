'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setMessageRead, deleteMessage } from '@/app/admin/actions';
import type { Message } from '@/lib/types';
import { btn } from './ui';

export default function Inbox({ messages }: { messages: Message[] }) {
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => start(async () => {
    const r = await fn(); setErr(r.ok ? '' : r.error ?? '실패'); router.refresh();
  });
  const toggle = (m: Message) => {
    setOpen(open === m.id ? null : m.id);
    if (!m.is_read) run(() => setMessageRead(m.id, true));
  };
  const copy = (t: string) => { navigator.clipboard?.writeText(t).catch(() => {}); };

  if (!messages.length) return <div className="pixel-box bg-slate-900 p-8 text-center text-slate-500">받은 편지가 없어요.</div>;
  return (
    <div className="space-y-3">
      {err && <p className="text-sm text-red-400">{err}</p>}
      {messages.map((m) => (
        <div key={m.id} className={`pixel-box bg-slate-900 ${m.is_read ? '' : 'border-emerald-600'}`}>
          <button onClick={() => toggle(m)} className="w-full text-left p-4 flex items-start gap-3" aria-expanded={open === m.id}>
            <span className={`mt-1.5 w-2.5 h-2.5 shrink-0 ${m.is_read ? 'bg-slate-700' : 'bg-red-500'}`} aria-label={m.is_read ? '읽음' : '안 읽음'} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <b className={m.is_read ? 'text-slate-300' : 'text-white'}>{m.name}</b>
                {m.email && <span className="text-sm text-slate-400">{m.email}</span>}
                <span className="font-term text-base text-slate-500 ml-auto">{new Date(m.created_at).toLocaleString('ko-KR')}</span>
              </div>
              <p className={`text-sm text-slate-400 ${open === m.id ? 'hidden' : 'truncate'}`}>{m.body}</p>
            </div>
          </button>
          {open === m.id && (
            <div className="px-4 pb-4 pl-10 space-y-3">
              <p className="whitespace-pre-wrap break-words text-slate-200 leading-relaxed bg-slate-950 border border-slate-800 p-3">{m.body}</p>
              <div className="flex flex-wrap gap-2 items-center">
                {m.email && <button onClick={() => copy(m.email)} className={btn.ghost}><i className="fa-solid fa-copy" /> 이메일 복사</button>}
                <button onClick={() => run(() => setMessageRead(m.id, !m.is_read))} disabled={pending} className={btn.ghost}>{m.is_read ? '안 읽음으로' : '읽음으로'}</button>
                {confirm === m.id ? (
                  <span className="flex items-center gap-2 text-sm text-red-300">지울까요?
                    <button onClick={() => run(() => deleteMessage(m.id))} disabled={pending} className={btn.danger}>삭제</button>
                    <button onClick={() => setConfirm(null)} className={btn.ghost}>취소</button>
                  </span>
                ) : <button onClick={() => setConfirm(m.id)} className={btn.danger}><i className="fa-solid fa-trash" /> 삭제</button>}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
