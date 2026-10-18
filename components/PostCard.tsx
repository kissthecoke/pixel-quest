import Link from 'next/link';
import { colorOf } from '@/lib/colors';
import type { Post } from '@/lib/types';

export const fmtDate = (d: string | null) => (d ? d.slice(0, 10) : '-');

export function CategoryBadge({ post }: { post: Post }) {
  const c = post.category;
  return (
    <span className={`font-pixel text-[10px] px-2 py-0.5 border ${colorOf(c?.color ?? 'red').badge}`}>
      {c ? c.slug.toUpperCase() : 'ETC'}
    </span>
  );
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/posts/${encodeURIComponent(post.slug)}`}
      className="pixel-box p-4 bg-slate-900 border-2 border-slate-700 hover:border-amber-400 transition flex flex-col sm:flex-row gap-4 items-start">
      <div className="w-14 h-14 bg-slate-950 border border-slate-700 flex items-center justify-center text-3xl shrink-0">{post.icon}</div>
      <div className="flex-grow space-y-2 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryBadge post={post} />
          <span className="font-term text-base text-slate-400"><i className="fa-regular fa-clock" /> {fmtDate(post.published_at)}</span>
        </div>
        <h3 className="font-title text-base md:text-lg text-amber-300">{post.title}</h3>
        <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">{post.summary}</p>
      </div>
      <div className="shrink-0 flex sm:flex-col items-center justify-between w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3 gap-2">
        <span className="text-xs text-red-400 font-pixel"><i className="fa-solid fa-heart" /> +{post.likes}</span>
        <span className="btn-retro text-[10px] font-pixel bg-slate-800 px-2 py-1 text-slate-300 border border-slate-600">INSPECT</span>
      </div>
    </Link>
  );
}
