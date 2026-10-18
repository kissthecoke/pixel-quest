import PostCard from '@/components/PostCard';
import { getCategories, getPublishedPosts } from '@/lib/data';

export default async function FeedPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  const [posts, categories] = await Promise.all([getPublishedPosts(), getCategories()]);
  const current = categories.find((c) => c.slug === cat);
  const list = current ? posts.filter((p) => p.category_id === current.id) : posts;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 p-3 border-2 border-slate-700">
        <h2 className="font-pixel text-sm text-amber-400 flex items-center gap-2"><i className="fa-solid fa-scroll" /> ACTIVE_QUESTS</h2>
        <span className="text-sm text-slate-400">{list.length}개의 퀘스트 · {current ? current.name : '전체'}</span>
      </div>
      <div className="space-y-4">
        {list.length ? list.map((p) => <PostCard key={p.id} post={p} />) : (
          <div className="pixel-box p-8 bg-slate-900 text-center text-slate-400">이 카테고리에는 아직 퀘스트가 없어요.</div>
        )}
      </div>
    </div>
  );
}
