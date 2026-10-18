'use client';
import { useState, useTransition } from 'react';
import { sendMessage } from '@/app/actions';
import { useRetro } from './RetroProvider';

export default function ContactForm() {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const { play } = useRetro();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const form = e.currentTarget;
    start(async () => {
      const r = await sendMessage({
        name: String(f.get('name') || ''), email: String(f.get('email') || ''),
        body: String(f.get('body') || ''), website: String(f.get('website') || '')
      });
      if (r.ok) { play('coin'); form.reset(); setResult({ ok: true, msg: '✔ TRANSMISSION RECEIVED. 편지가 잘 도착했어요. 답장은 적어 주신 이메일로 보낼게요.' }); }
      else setResult({ ok: false, msg: '✖ ' + (r.error ?? '전송 실패') });
    });
  };

  const input = 'w-full bg-slate-950 border-2 border-slate-700 p-2 text-emerald-400 focus:border-emerald-500 outline-none';
  return (
    <div className="pixel-box p-6 border-emerald-500 bg-slate-900 space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <i className="fa-solid fa-terminal text-emerald-400 text-lg" />
        <h2 className="font-pixel text-sm text-emerald-400">TRANSMIT // CONTACT</h2>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 text-sm">
        <div>
          <label htmlFor="c-name" className="block text-xs font-title text-slate-400 mb-2">COMMANDER_NAME · 이름</label>
          <input id="c-name" name="name" required maxLength={40} placeholder="플레이어 원" className={input} />
        </div>
        <div>
          <label htmlFor="c-mail" className="block text-xs font-title text-slate-400 mb-2">FREQUENCY · 답장 받을 이메일 (선택)</label>
          <input id="c-mail" name="email" type="email" maxLength={120} placeholder="player@arcade.com" className={input} />
        </div>
        <div className="hidden" aria-hidden="true">
          <label htmlFor="c-web">website</label><input id="c-web" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        <div>
          <label htmlFor="c-msg" className="block text-xs font-title text-slate-400 mb-2">TRANSMISSION_MESSAGE · 내용</label>
          <textarea id="c-msg" name="body" rows={5} required maxLength={3000} placeholder="협업 제안이나 하고 싶은 이야기를 적어 주세요." className={input} />
        </div>
        <button type="submit" disabled={pending} className="btn-retro w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-pixel text-xs border-2 border-emerald-300 disabled:opacity-60">
          <i className="fa-solid fa-paper-plane" /> {pending ? 'TRANSMITTING...' : 'SEND TRANSMISSION'}
        </button>
      </form>
      {result && (
        <div className={`p-3 border text-sm ${result.ok ? 'bg-emerald-950 border-emerald-500 text-emerald-300' : 'bg-red-950 border-red-500 text-red-300'}`}>{result.msg}</div>
      )}
    </div>
  );
}
