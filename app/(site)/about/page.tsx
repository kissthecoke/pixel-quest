import Link from 'next/link';
import { getProfile, getPublishedPosts } from '@/lib/data';

export const metadata = { title: 'STATS' };

export default async function AboutPage() {
  const [profile, posts] = await Promise.all([getProfile(), getPublishedPosts()]);
  const totalLikes = posts.reduce((s, p) => s + p.likes, 0);
  return (
    <div className="pixel-box p-6 border-indigo-600 bg-slate-900 space-y-6">
      <div className="flex flex-col md:flex-row items-center gap-6 border-b border-slate-800 pb-6">
        <div className="w-28 h-28 shrink-0 bg-indigo-950 border-4 border-indigo-500 flex items-center justify-center relative shadow-lg">
          <i className="fa-solid fa-user-astronaut text-6xl text-amber-400" />
          <span className="absolute -bottom-3 bg-amber-500 text-slate-950 text-[10px] font-pixel px-2 py-0.5 whitespace-nowrap">QUESTS {posts.length}</span>
        </div>
        <div className="space-y-3 text-center md:text-left min-w-0">
          <h2 className="font-pixel text-lg text-amber-400 break-all">{profile.name}</h2>
          <p className="text-slate-300 text-base leading-relaxed max-w-xl whitespace-pre-line">{profile.bio}</p>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-1">
            <span className="bg-purple-900/60 text-purple-300 border border-purple-500 font-term text-base px-2">[CLASS: {profile.class_label}]</span>
            <span className="bg-blue-900/60 text-blue-300 border border-blue-500 font-term text-base px-2">[ALIGNMENT: {profile.alignment}]</span>
            <span className="bg-red-900/60 text-red-300 border border-red-500 font-term text-base px-2">[TOTAL HP: {totalLikes}]</span>
          </div>
        </div>
      </div>

      {profile.skills.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-pixel text-xs text-cyan-400"><i className="fa-solid fa-chart-simple" /> SKILL_TREE_LEVELS</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.skills.map((s) => (
              <div key={s.name}>
                <div className="flex justify-between text-sm mb-1"><span>{s.name}</span><span className="text-amber-400 font-pixel text-[10px]">LV. {s.level}</span></div>
                <div className="bar-container"><div className="bar-fill-xp" style={{ width: `${Math.min(100, Math.max(0, s.level))}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-slate-800">
        <h3 className="font-pixel text-xs text-amber-400 mb-3"><i className="fa-solid fa-shield-halved" /> EQUIPPED_ITEMS (SOCIAL)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {profile.socials.map((s) => (
            <a key={s.url + s.label} href={s.url} target="_blank" rel="noopener noreferrer"
              className="btn-retro bg-slate-800 hover:bg-slate-700 p-3 border-2 border-slate-600 flex items-center gap-3 min-w-0">
              <i className={`${s.icon || 'fa-solid fa-link'} text-xl text-purple-400`} />
              <div className="min-w-0"><div className="font-pixel text-[10px] text-slate-300">{s.label}</div><div className="text-sm text-slate-500 truncate">{s.handle}</div></div>
            </a>
          ))}
          <Link href="/contact" className="btn-retro bg-slate-800 hover:bg-slate-700 p-3 border-2 border-slate-600 flex items-center gap-3">
            <i className="fa-solid fa-envelope text-xl text-emerald-400" />
            <div><div className="font-pixel text-[10px] text-slate-300">EMAIL</div><div className="text-sm text-slate-500">터미널에서 편지 쓰기</div></div>
          </Link>
        </div>
      </div>
    </div>
  );
}
