import Link from 'next/link';
import { PageHead, btn } from '@/components/admin/ui';
import { adminGetPosts } from '@/lib/data';
import { colorOf } from '@/lib/colors';

export default async function PostsAdmin({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status, q } = await searchParams;
  const all = await adminGetPosts();
  const now = Date.now();
  let list = all;
  if (status === 'draft' || status === 'published') list = list.filter((p) => p.status === status);
  if (q) list = list.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()));
  const tab = (s: string | undefined, label: string, n: number) => (
    <Link href={s ? `/admin/posts?status=${s}` : '/admin/posts'}
      className={`btn-retro font-pixel text-[9px] px-3 py-2 border-2 ${status === s ? 'bg-amber-500 text-slate-950 border-amber-300' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>{label} {n}</Link>
  );

  return (
    <>
      <PageHead title="QUESTS" ko="글을 쓰고 고치고 지워요">
        <Link href="/admin/posts/new" className={btn.primary}><i className="fa-solid fa-plus" /> NEW QUEST</Link>
      </PageHead>
      <div className="flex flex-wrap items-center gap-2">
        {tab(undefined, 'ALL', all.length)}
        {tab('published', 'PUBLISHED', all.filter((p) => p.status === 'published').length)}
        {tab('draft', 'DRAFT', all.filter((p) => p.status === 'draft').length)}
        <form className="ml-auto">
          {status && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={q} placeholder="제목 검색" className="bg-slate-950 border-2 border-slate-700 px-2 py-1.5 text-sm outline-none focus:border-emerald-500" />
        </form>
      </div>

      <div className="pixel-box bg-slate-900 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left font-pixel text-[8px] text-slate-500 border-b-2 border-slate-800">
              <th className="p-3">TITLE</th><th className="p-3">CATEGORY</th><th className="p-3">STATUS</th><th className="p-3">DATE</th><th className="p-3 text-right">HP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {list.map((p) => {
              const scheduled = p.status === 'published' && p.published_at && new Date(p.published_at).getTime() > now;
              return (
                <tr key={p.id} className="hover:bg-slate-800/50">
                  <td className="p-3">
                    <Link href={`/admin/posts/${p.id}`} className="flex items-center gap-2 hover:text-amber-300">
                      <span className="text-lg">{p.icon}</span><span className="truncate max-w-[320px]">{p.title}</span>
                    </Link>
                  </td>
                  <td className="p-3">{p.category ? <span className={colorOf(p.category.color).text}>{p.category.icon} {p.category.name}</span> : <span className="text-slate-500">미분류</span>}</td>
                  <td className="p-3">
                    <span className={`font-pixel text-[8px] px-2 py-1 border ${scheduled ? 'border-cyan-500 text-cyan-300' : p.status === 'published' ? 'border-emerald-500 text-emerald-300' : 'border-slate-500 text-slate-400'}`}>
                      {scheduled ? 'SCHEDULED' : p.status === 'published' ? 'LIVE' : 'DRAFT'}
                    </span>
                  </td>
                  <td className="p-3 font-term text-base text-slate-400">{(p.published_at ?? p.created_at).slice(0, 10)}</td>
                  <td className="p-3 text-right font-term text-lg text-red-400">{p.likes}</td>
                </tr>
              );
            })}
            {!list.length && <tr><td colSpan={5} className="p-6 text-center text-slate-500">글이 없어요.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
