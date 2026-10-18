import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Dialogue from '@/components/Dialogue';
import LikeButton from '@/components/LikeButton';
import { CategoryBadge, fmtDate } from '@/components/PostCard';
import { getPostBySlug } from '@/lib/data';
import { renderMarkdown } from '@/lib/markdown';

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const post = await getPostBySlug(decodeURIComponent((await params).slug));
  return post ? { title: post.title, description: post.summary } : { title: '퀘스트를 찾을 수 없어요' };
}

export default async function PostPage({ params }: P) {
  const post = await getPostBySlug(decodeURIComponent((await params).slug));
  if (!post) notFound();

  return (
    <article className="pixel-box-neon w-full flex flex-col bg-slate-900 text-slate-100 overflow-hidden">
      <div className="bg-slate-950 p-4 border-b-2 border-slate-800 flex justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <CategoryBadge post={post} />
          <span className="font-term text-lg text-slate-400">{fmtDate(post.published_at)}</span>
        </div>
        <Link href="/" className="btn-retro text-slate-400 hover:text-white px-2 py-1 font-pixel text-xs">[X] ESC</Link>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-slate-950 border border-slate-700 flex items-center justify-center text-3xl shrink-0">{post.icon}</div>
          <h1 className="font-title text-xl md:text-2xl text-amber-400 pt-2">{post.title}</h1>
        </div>
        <Dialogue html={renderMarkdown(post.content)} />
      </div>
      <div className="bg-slate-950 p-4 border-t-2 border-slate-800 flex flex-wrap justify-between items-center gap-3">
        <LikeButton postId={post.id} initial={post.likes} />
        <Link href="/" className="btn-retro px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 font-pixel text-xs">CLOSE DIALOGUE</Link>
      </div>
    </article>
  );
}
