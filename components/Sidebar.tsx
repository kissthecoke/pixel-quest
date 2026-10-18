'use client';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { tone, useRetro } from './RetroProvider';
import { colorOf } from '@/lib/colors';
import type { Category } from '@/lib/types';

/* ---------------- 칩튠 트랙 ---------------- */
const TRACKS = [
  {
    title: '8-BIT CHIPTUNE AMBIANCE', interval: 220,
    // 원본 곡: C 메이저 음계를 톱니파로
    play(step: number) {
      const notes = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88];
      tone(notes[(step * 3 + step) % notes.length], 0.18, 'sawtooth', 0.05);
    }
  },
  {
    title: 'NEON NIGHT DRIVE', interval: 170,
    // 새 곡: 사각파 아르페지오 + 삼각파 베이스
    play(step: number) {
      const LEAD = [659, 784, 988, 784, 659, 784, 988, 1175, 587, 740, 880, 740, 523, 659, 784, 659];
      const BASS = [165, 165, 147, 131];
      tone(LEAD[step % 16], 0.14, 'square', 0.035);
      if (step % 4 === 0) tone(BASS[(step >> 4) % 4] / 2, 0.32, 'triangle', 0.12);
    }
  }
];

function Synth() {
  const { soundOn, play } = useRetro();
  const [track, setTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [bars, setBars] = useState<number[]>(Array(12).fill(10));
  const soundRef = useRef(soundOn);
  soundRef.current = soundOn;

  useEffect(() => { try { setTrack(Number(localStorage.getItem('pq_track') || 0) % TRACKS.length); } catch { /* */ } }, []);

  useEffect(() => {
    if (!playing) { setBars(Array(12).fill(10)); return; }
    const tr = TRACKS[track];
    let step = 0;
    const id = setInterval(() => {
      if (soundRef.current) tr.play(step);
      setBars(Array.from({ length: 12 }, () => 12 + Math.random() * 85));
      step++;
    }, tr.interval);
    return () => clearInterval(id);
  }, [playing, track]);

  const change = (d: number) => {
    const n = (track + d + TRACKS.length) % TRACKS.length;
    setTrack(n); play('blip');
    try { localStorage.setItem('pq_track', String(n)); } catch { /* */ }
  };

  return (
    <div className="pixel-box p-4 border-cyan-600 bg-slate-900">
      <div className="flex items-center justify-between mb-2">
        <span className="font-pixel text-xs text-cyan-400"><i className="fa-solid fa-radio" /> RETRO_SYNTH</span>
        <span className={`font-term text-base ${playing ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`}>{playing ? 'PLAYING ♫' : 'OFF'}</span>
      </div>
      <div className="bg-slate-950 p-2 border border-slate-800 mb-3 space-y-2">
        <div className="eq" aria-hidden="true">{bars.map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}</div>
        <div className="flex items-center justify-between gap-2">
          <button onClick={() => change(-1)} className="btn-retro text-cyan-400 hover:text-white px-1 font-pixel text-xs" aria-label="이전 곡">◀</button>
          <div className="text-center min-w-0">
            <p className="font-pixel text-[8px] text-slate-500">TRACK {String(track + 1).padStart(2, '0')} / {String(TRACKS.length).padStart(2, '0')}</p>
            <p className="font-term text-lg text-cyan-300 tracking-widest truncate">{TRACKS[track].title}</p>
          </div>
          <button onClick={() => change(1)} className="btn-retro text-cyan-400 hover:text-white px-1 font-pixel text-xs" aria-label="다음 곡">▶</button>
        </div>
      </div>
      <button onClick={() => { tone(1, 0.001, 'sine', 0.0001); setPlaying((p) => !p); }}
        className="btn-retro w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-pixel text-xs border border-cyan-300">
        <i className={`fa-solid ${playing ? 'fa-pause' : 'fa-play'}`} /> {playing ? 'PAUSE' : 'PLAY'}
      </button>
    </div>
  );
}

function CategoryKeys({ categories }: { categories: Category[] }) {
  const params = useSearchParams();
  const path = usePathname();
  const { play } = useRetro();
  const active = path === '/' ? params.get('cat') ?? 'all' : '';
  const base = 'cat-btn bg-slate-800 border border-slate-600 p-2 text-left truncate block';
  return (
    <div className="pixel-box p-4 border-amber-600 bg-slate-900">
      <h3 className="font-pixel text-xs text-amber-400 mb-3 flex items-center gap-2"><i className="fa-solid fa-key" /> CATEGORY_KEYS</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <Link href="/" scroll={false} onClick={() => play('blip')}
          className={`${base} text-amber-300 hover:bg-amber-600 hover:text-slate-950 ${active === 'all' ? 'ring-2 ring-amber-400' : ''}`}>[ALL] 전체</Link>
        {categories.map((c) => {
          const col = colorOf(c.color);
          return (
            <Link key={c.id} href={`/?cat=${c.slug}`} scroll={false} onClick={() => play('blip')}
              className={`${base} ${col.text} ${col.hover} ${active === c.slug ? `ring-2 ${col.ring}` : ''}`}>
              [{c.icon}] {c.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function Sidebar({ categories, location }: { categories: Category[]; location: string }) {
  return (
    <aside className="lg:col-span-1 space-y-6 order-2 lg:order-1">
      <div className="pixel-box p-4 border-emerald-600 bg-slate-900">
        <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-3">
          <span className="font-pixel text-xs text-emerald-400"><i className="fa-solid fa-map" /> MINI_MAP</span>
          <span className="font-term text-base text-slate-400">{location}</span>
        </div>
        <div className="w-full h-36 bg-slate-950 border-2 border-emerald-900 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:12px_12px] opacity-30" />
          <div className="absolute w-full h-full border-r-2 border-emerald-500/50 origin-center animate-[spin_4s_linear_infinite]" />
          <div className="absolute w-2 h-2 bg-red-500 rounded-full top-1/3 left-1/4 animate-ping" />
          <div className="absolute w-2 h-2 bg-amber-400 rounded-full top-1/2 right-1/3" />
          <div className="absolute w-3 h-3 bg-cyan-400 border border-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          <span className="absolute bottom-1 right-2 font-term text-base text-emerald-500">GPS: ACTIVE</span>
        </div>
      </div>
      <Suspense fallback={<div className="pixel-box p-4 border-amber-600 bg-slate-900 h-40" />}>
        <CategoryKeys categories={categories} />
      </Suspense>
      <Synth />
    </aside>
  );
}
