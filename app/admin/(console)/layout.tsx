import AdminNav from '@/components/admin/AdminNav';
import { adminGetMessages, getAdminState } from '@/lib/data';
import { signOut } from '../actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'GM_CONSOLE', robots: { index: false } };

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const state = await getAdminState();
  if (!state.ok) {
    return (
      <div className="min-h-screen flex items-center justify-center gutter">
        <div className="pixel-box bg-slate-900 border-red-600 p-6 max-w-sm text-center space-y-4">
          <p className="font-pixel text-xs text-red-400">ACCESS DENIED</p>
          <p className="text-sm text-slate-300">{state.email} 계정은 관리자로 등록되어 있지 않아요. Supabase의 app_admins 표에 이메일을 추가해 주세요.</p>
          <form action={signOut}><button className="btn-retro bg-slate-800 border border-slate-600 font-pixel text-[10px] px-4 py-2">LOGOUT</button></form>
        </div>
      </div>
    );
  }
  const unread = (await adminGetMessages()).filter((m) => !m.is_read).length;
  return (
    <div className="min-h-screen bg-slate-950">
      <header className="bg-slate-900 border-b-4 border-emerald-700 gutter">
        <div className="max-w-7xl mx-auto py-3 flex items-center justify-between gap-3">
          <span className="font-pixel text-xs text-emerald-400"><i className="fa-solid fa-terminal" /> GM_CONSOLE <span className="text-slate-500">// PIXEL QUEST</span></span>
          {state.demo && <span className="bg-amber-500 text-slate-950 text-xs font-bold px-2 py-0.5">데모 모드 · 저장 안 됨</span>}
        </div>
      </header>
      <div className="max-w-7xl mx-auto gutter py-6 grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-6">
        <AdminNav unread={unread} email={state.email} />
        <main className="min-w-0 space-y-6">{children}</main>
      </div>
    </div>
  );
}
