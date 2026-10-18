import RetroProvider from '@/components/RetroProvider';
import SiteHeader from '@/components/SiteHeader';
import Sidebar from '@/components/Sidebar';
import { getCategories, getProfile } from '@/lib/data';
import { IS_DEMO } from '@/lib/supabase/config';

export const revalidate = 60;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [categories, profile] = await Promise.all([getCategories(), getProfile()]);
  return (
    <RetroProvider>
      <SiteHeader />
      {IS_DEMO && (
        <div className="bg-amber-500 text-slate-950 text-center text-xs font-bold py-1 gutter">데모 모드 · Supabase를 연결하기 전이라 예시 데이터를 보여주고 있어요</div>
      )}
      <main className="flex-grow max-w-7xl w-full mx-auto py-4 md:py-6 gutter grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Sidebar categories={categories} location={profile.location} />
        <section className="lg:col-span-3 space-y-6 order-1 lg:order-2 min-w-0">{children}</section>
      </main>
      <footer className="border-t-4 border-slate-700 bg-slate-900 gutter">
        <div className="max-w-7xl mx-auto py-4 flex flex-wrap justify-between gap-2 font-term text-lg text-slate-500">
          <span>© {new Date().getFullYear()} PIXEL QUEST</span>
          <span className="text-amber-400 animate-pulse">INSERT COIN ▮</span>
        </div>
      </footer>
    </RetroProvider>
  );
}
