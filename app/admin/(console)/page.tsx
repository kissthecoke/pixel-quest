import Link from 'next/link';
import { PageHead, btn } from '@/components/admin/ui';
import { adminGetCategories, adminGetMessages, adminGetPosts, adminGetScores } from '@/lib/data';
import { colorOf } from '@/lib/colors';

export default async function Dashboard() {
  const [posts, cats, msgs, scores] = await Promise.all([adminGetPosts(), adminGetCategories(), adminGetMessages(), adminGetScores()]);
  const published = posts.filter((p) => p.status === 'published');
  const drafts = posts.length - published.length;
  const unread = msgs.filter((m) => !m.is_read).length;
  const likes = posts.reduce((s, p) => s + p.likes, 0);
  const top = [...published].sort((a, b) => b.likes - a.likes).slice(0, 5);
  const perCat = cats.map((c) => ({ c, n: published.filter((p) => p.category_id === c.id).length }));
  const uncategorized = published.filter((p) => !p.category_id).length;
  const maxN = Math.max(1, ...perCat.map((x) => x.n), uncategorized);

  const tiles = [
    { label: 'PUBLISHED', ko: '발행한 글', v: published.length, c: 'text-amber-300', href: '/admin/posts' },
    { label: 'DRAFTS', ko: '초안', v: drafts, c: 'text-slate-300', href: '/admin/posts?status=draft' },
    { label: 'NEW MAIL', ko: '안 읽은 편지', v: unread, c: unread ? 'text-red-400' : 'text-slate-300', href: '/admin/messages' },
    { label: 'TOTAL HP', ko: '받은 좋아요', v: likes, c: 'text-pink-300', href: '/admin/posts' },
    { label: 'HI-SCORE', ko: `랭킹 기록 ${scores.length}개`, v: scores[0]?.score ?? 0, c: 'text-cyan-300', href: '/admin/scores' }
  ];

  return (
    <>
      <PageHead title="DASHBOARD" ko="홈페이지 현황을 한눈에 봐요">
        <Link href="/admin/posts/new" className={btn.primary}><i className="fa-solid fa-plus" /> NEW QUEST</Link>
      </PageHead>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="pixel-box bg-slate-900 p-4 hover:border-amber-500">
            <p className="font-pixel text-[8px] text-slate-500">{t.label}</p>
            <p className={`font-pixel text-lg mt-2 tabular-nums ${t.c}`}>{t.v}</p>
            <p className="text-xs text-slate-400 mt-1">{t.ko}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="pixel-box bg-slate-900 p-4">
          <h2 className="font-title text-sm text-pink-400 mb-3"><i className="fa-solid fa-heart" /> 인기 글 TOP 5</h2>
          {top.length ? (
            <ol className="space-y-2">
              {top.map((p, i) => (
                <li key={p.id} className="flex items-center gap-3">
                  <span className="font-pixel text-[9px] text-slate-500 w-5">{i + 1}</span>
                  <span className="text-lg">{p.icon}</span>
                  <Link href={`/admin/posts/${p.id}`} className="flex-1 truncate text-sm hover:text-amber-300">{p.title}</Link>
                  <span className="font-term text-lg text-red-400 tabular-nums">♥ {p.likes}</span>
                </li>
              ))}
            </ol>
          ) : <p className="text-sm text-slate-500">아직 발행한 글이 없어요.</p>}
        </section>

        <section className="pixel-box bg-slate-900 p-4">
          <h2 className="font-title text-sm text-cyan-400 mb-3"><i className="fa-solid fa-chart-simple" /> 카테고리별 글 수</h2>
          <div className="space-y-2">
            {perCat.map(({ c, n }) => (
              <div key={c.id} className="grid grid-cols-[110px_minmax(0,1fr)_28px] items-center gap-2 text-sm">
                <span className="truncate">{c.icon} {c.name}</span>
                <div className="h-3 bg-slate-950 border border-slate-800"><div className={`h-full ${colorOf(c.color).swatch}`} style={{ width: `${(n / maxN) * 100}%` }} /></div>
                <span className="font-term text-lg text-right tabular-nums">{n}</span>
              </div>
            ))}
            {uncategorized > 0 && (
              <div className="grid grid-cols-[110px_minmax(0,1fr)_28px] items-center gap-2 text-sm text-slate-400">
                <span>미분류</span>
                <div className="h-3 bg-slate-950 border border-slate-800"><div className="h-full bg-slate-500" style={{ width: `${(uncategorized / maxN) * 100}%` }} /></div>
                <span className="font-term text-lg text-right">{uncategorized}</span>
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="pixel-box bg-slate-900 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-title text-sm text-emerald-400"><i className="fa-solid fa-envelope" /> 최근 편지</h2>
          <Link href="/admin/messages" className="text-xs text-slate-400 hover:text-white">모두 보기 →</Link>
        </div>
        {msgs.length ? (
          <ul className="divide-y divide-slate-800">
            {msgs.slice(0, 3).map((m) => (
              <li key={m.id} className="py-2 flex gap-3 text-sm">
                {!m.is_read && <span className="mt-1.5 w-2 h-2 bg-red-500 shrink-0" aria-label="안 읽음" />}
                <div className="min-w-0"><b>{m.name}</b> <span className="text-slate-500 font-term text-base">{m.created_at.slice(0, 10)}</span><p className="text-slate-400 truncate">{m.body}</p></div>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-slate-500">받은 편지가 없어요.</p>}
      </section>
    </>
  );
}
