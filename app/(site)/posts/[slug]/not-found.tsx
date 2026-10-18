import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="pixel-box p-8 bg-slate-900 text-center space-y-4">
      <p className="font-pixel text-amber-400 text-sm">QUEST NOT FOUND</p>
      <p className="text-slate-400">이 글은 없거나 아직 공개되지 않았어요.</p>
      <Link href="/" className="btn-retro inline-block bg-slate-800 border border-slate-600 font-pixel text-xs px-4 py-2">BACK TO LOG</Link>
    </div>
  );
}
