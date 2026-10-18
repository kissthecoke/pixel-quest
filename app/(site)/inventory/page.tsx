import Link from 'next/link';
import { getPublishedPosts } from '@/lib/data';

export const metadata = { title: 'INVENTORY' };

export default async function InventoryPage() {
  const posts = await getPublishedPosts();
  const slots = Math.max(8, Math.ceil(posts.length / 4) * 4);
  return (
    <div className="space-y-4">
      <div className="bg-slate-900 p-3 border-2 border-slate-700">
        <h2 className="font-pixel text-sm text-amber-400 flex items-center gap-2"><i className="fa-solid fa-boxes-stacked" /> INVENTORY_ARCHIVE</h2>
        <p className="text-sm text-slate-400 mt-2">아이템 슬롯을 누르면 글이 열려요. 지금까지 {posts.length}개의 아이템을 모았어요.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-slate-900 p-4 border-2 border-slate-800">
        {Array.from({ length: slots }, (_, i) => {
          const p = posts[i];
          return p ? (
            <Link key={p.id} href={`/posts/${encodeURIComponent(p.slug)}`} title={p.title}
              className="bg-slate-950 border-2 border-slate-700 hover:border-amber-400 p-3 flex flex-col items-center justify-center text-center gap-1 aspect-square transition hover:scale-105 min-w-0">
              <div className="text-3xl">{p.icon}</div>
              <div className="text-xs font-bold text-amber-300 line-clamp-2 w-full">{p.title}</div>
              <div className="font-term text-base text-slate-500">[{p.category?.slug.toUpperCase() ?? 'ETC'}]</div>
            </Link>
          ) : (
            <div key={`e${i}`} className="bg-slate-950/60 border-2 border-dashed border-slate-800 aspect-square flex items-center justify-center font-pixel text-[8px] text-slate-700">EMPTY</div>
          );
        })}
      </div>
    </div>
  );
}
