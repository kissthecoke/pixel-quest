'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from '@/app/admin/actions';

const ITEMS = [
  { href: '/admin', label: 'DASHBOARD', ko: '현황', icon: 'fa-gauge' },
  { href: '/admin/posts', label: 'QUESTS', ko: '글 관리', icon: 'fa-scroll' },
  { href: '/admin/categories', label: 'CATEGORIES', ko: '카테고리', icon: 'fa-key' },
  { href: '/admin/messages', label: 'INBOX', ko: '편지함', icon: 'fa-envelope' },
  { href: '/admin/scores', label: 'RANKING', ko: '게임 랭킹', icon: 'fa-trophy' },
  { href: '/admin/profile', label: 'PROFILE', ko: '프로필', icon: 'fa-id-card' }
];

export default function AdminNav({ unread, email }: { unread: number; email: string | null }) {
  const path = usePathname();
  const on = (h: string) => (h === '/admin' ? path === '/admin' : path.startsWith(h));
  return (
    <nav className="space-y-4" aria-label="관리자 메뉴">
      <div className="pixel-box p-3 bg-slate-900 border-emerald-600 text-center">
        <i className="fa-solid fa-user-shield text-2xl text-emerald-400" />
        <p className="font-pixel text-[10px] text-emerald-400 mt-2">GAME MASTER</p>
        <p className="text-xs text-slate-500 truncate mt-1">{email}</p>
      </div>
      <div className="flex lg:flex-col gap-2 overflow-x-auto pb-1">
        {ITEMS.map((it) => (
          <Link key={it.href} href={it.href}
            className={`btn-retro shrink-0 flex items-center gap-3 px-3 py-2 border-2 ${on(it.href) ? 'bg-amber-500 text-slate-950 border-amber-300' : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'}`}>
            <i className={`fa-solid ${it.icon} w-4 text-center`} />
            <span className="flex flex-col leading-tight">
              <span className="font-pixel text-[9px]">{it.label}</span>
              <span className="text-xs opacity-80">{it.ko}</span>
            </span>
            {it.href === '/admin/messages' && unread > 0 && <span className="ml-auto bg-red-600 text-white font-pixel text-[8px] px-1.5 py-0.5">{unread}</span>}
          </Link>
        ))}
      </div>
      <div className="flex lg:flex-col gap-2">
        <Link href="/" target="_blank" className="btn-retro flex-1 text-center bg-slate-900 border-2 border-cyan-700 text-cyan-300 font-pixel text-[9px] px-3 py-2"><i className="fa-solid fa-arrow-up-right-from-square" /> VIEW SITE</Link>
        <form action={signOut} className="flex-1">
          <button className="btn-retro w-full bg-slate-900 border-2 border-red-800 text-red-300 font-pixel text-[9px] px-3 py-2"><i className="fa-solid fa-power-off" /> LOGOUT</button>
        </form>
      </div>
    </nav>
  );
}
