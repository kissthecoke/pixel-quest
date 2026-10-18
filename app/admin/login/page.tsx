'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBrowserClient } from '@/lib/supabase/browser';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const sb = getBrowserClient();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sb) { router.push('/admin'); return; }
    setBusy(true); setErr('');
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) { setErr('이메일 또는 비밀번호가 맞지 않아요'); return; }
    router.replace('/admin'); router.refresh();
  };

  const input = 'w-full bg-slate-950 border-2 border-slate-700 p-2.5 text-emerald-300 focus:border-emerald-500 outline-none';
  return (
    <div className="crt-overlay min-h-screen flex items-center justify-center gutter py-10">
      <form onSubmit={onSubmit} className="pixel-box w-full max-w-sm bg-slate-900 border-emerald-500 p-6 space-y-5">
        <div className="text-center space-y-2">
          <i className="fa-solid fa-user-shield text-4xl text-emerald-400" />
          <h1 className="font-pixel text-sm text-emerald-400">GM_CONSOLE</h1>
          <p className="text-sm text-slate-400">관리자 로그인</p>
        </div>
        {!sb && <p className="text-xs bg-amber-500 text-slate-950 p-2 font-bold">데모 모드예요. 로그인 없이 둘러볼 수 있어요.</p>}
        <div>
          <label htmlFor="email" className="block text-[10px] font-pixel text-slate-400 mb-2">EMAIL</label>
          <input id="email" type="email" autoComplete="email" required={!!sb} value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
        </div>
        <div>
          <label htmlFor="pw" className="block text-[10px] font-pixel text-slate-400 mb-2">PASSWORD</label>
          <input id="pw" type="password" autoComplete="current-password" required={!!sb} value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
        </div>
        {err && <p className="text-sm text-red-400">{err}</p>}
        <button disabled={busy} className="btn-retro w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-pixel text-xs border-2 border-emerald-300 disabled:opacity-60">
          {busy ? 'LOADING...' : sb ? 'PRESS START' : 'ENTER DEMO'}
        </button>
        <Link href="/" className="block text-center text-sm text-slate-500 hover:text-slate-300">← 홈페이지로</Link>
      </form>
    </div>
  );
}
