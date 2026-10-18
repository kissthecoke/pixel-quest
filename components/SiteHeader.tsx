'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRetro } from './RetroProvider';
import { getBrowserClient } from '@/lib/supabase/browser';

const TABS = [
  { href: '/', label: 'QUEST_LOG', icon: 'fa-scroll', zone: 'QUEST_LOG' },
  { href: '/inventory', label: 'INVENTORY', icon: 'fa-boxes-stacked', zone: 'INVENTORY' },
  { href: '/about', label: 'STATS(ABOUT)', icon: 'fa-id-card', zone: 'STATS' },
  { href: '/arcade', label: 'ARCADE_ZONE', icon: 'fa-gamepad animate-bounce', zone: 'ARCADE_ZONE', pink: true },
  { href: '/contact', label: 'TERMINAL', icon: 'fa-terminal', zone: 'TERMINAL' }
];

const isActive = (path: string, href: string) => (href === '/' ? path === '/' || path.startsWith('/posts') : path.startsWith(href));

export default function SiteHeader() {
  const path = usePathname();
  const { soundOn, toggleSound, toggleCrt, coins, level, play } = useRetro();
  const [isAdmin, setIsAdmin] = useState(false);
  const zone = TABS.find((t) => isActive(path, t.href))?.zone ?? 'QUEST_LOG';
  const cur = coins % 1000;

  useEffect(() => {
    const sb = getBrowserClient();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => setIsAdmin(!!data.session));
  }, []);

  return (
    <header className="hud sticky z-50 bg-slate-900 border-b-4 border-slate-700 py-2 shadow-2xl gutter">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-12 h-12 bg-indigo-900 border-2 border-amber-400 flex items-center justify-center relative overflow-hidden" aria-label="홈으로">
            <i className="fa-solid fa-user-ninja text-amber-400 text-2xl" />
            <span className="absolute bottom-0 right-0 bg-red-600 text-[10px] font-pixel px-1 text-white">{String(level).padStart(2, '0')}</span>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-pixel text-xs text-amber-400">PLAYER 1</span>
              <span className="bg-red-900 text-red-300 text-[10px] px-2 py-0.5 border border-red-500 font-pixel">BLOGGER</span>
            </div>
            <div className="w-36 mt-1">
              <div className="bar-container" title="다음 레벨까지 남은 경험치">
                <div className="bar-fill-xp" style={{ width: `${cur / 10}%` }} />
                <span className="absolute inset-0 text-[8px] font-pixel text-white flex items-center justify-center">EXP {cur}/1000</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-6 bg-slate-950 border-2 border-slate-700 px-4 py-1.5 rounded">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-coins text-amber-400 animate-pulse" />
            <span className="font-pixel text-xs text-amber-400 tabular-nums">{String(coins).padStart(7, '0')}</span>
          </div>
          <div className="flex items-center gap-2 border-l border-slate-700 pl-4">
            <i className="fa-solid fa-location-dot text-red-400" />
            <span className="font-term text-lg text-cyan-400 tracking-wider">ZONE: {zone}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleSound} className="btn-retro bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 p-2 text-amber-400" title="효과음 켜기/끄기" aria-label="효과음 켜기/끄기" aria-pressed={soundOn}>
            <i className={`fa-solid ${soundOn ? 'fa-volume-high' : 'fa-volume-xmark text-slate-500'} text-lg`} />
          </button>
          <button onClick={toggleCrt} className="btn-retro bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 p-2 text-cyan-400" title="CRT 효과 켜기/끄기" aria-label="CRT 효과 켜기/끄기">
            <i className="fa-solid fa-tv text-lg" />
          </button>
          {isAdmin && (
            <Link href="/admin/posts/new" onClick={() => play('open')} className="btn-retro bg-emerald-600 hover:bg-emerald-500 border-2 border-emerald-300 text-white font-pixel text-xs px-3 py-2 flex items-center gap-2">
              <i className="fa-solid fa-plus" /> <span className="hidden md:inline">NEW QUEST</span>
            </Link>
          )}
        </div>
      </div>

      <nav className="max-w-7xl mx-auto mt-2 pt-2 border-t border-slate-800 flex items-center gap-2 overflow-x-auto pb-1 text-sm" aria-label="메뉴">
        {TABS.map((t) => {
          const on = isActive(path, t.href);
          return (
            <Link key={t.href} href={t.href} onClick={() => play('blip')} aria-current={on ? 'page' : undefined}
              className={`btn-retro px-3 py-1 border-2 font-pixel text-xs flex items-center gap-2 shrink-0 ${
                on ? 'bg-amber-500 text-slate-950 border-amber-300'
                   : `bg-slate-800 border-slate-700 ${t.pink ? 'text-pink-400 hover:border-pink-500' : 'text-slate-300 hover:border-slate-500'}`}`}>
              <i className={`fa-solid ${t.icon}`} /> {t.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
