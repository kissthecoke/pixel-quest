'use client';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useRetro } from './RetroProvider';
import { submitScore } from '@/app/actions';
import type { Score } from '@/lib/types';

type Run = { score: number; coins: number; seconds: number };
type Phase = 'ready' | 'playing' | 'over';

export default function ArcadeGame({ scores }: { scores: Score[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const moveRef = useRef<(d: number) => void>(() => {});
  const startRef = useRef<() => void>(() => {});
  const [phase, setPhase] = useState<Phase>('ready');
  const [run, setRun] = useState<Run | null>(null);
  const [best, setBest] = useState(0);
  const [nick, setNick] = useState('');
  const [submitted, setSubmitted] = useState<number | null>(null);
  const [err, setErr] = useState('');
  const [pending, start] = useTransition();
  const router = useRouter();
  const retro = useRetro();
  const retroRef = useRef(retro);
  retroRef.current = retro;

  useEffect(() => {
    try { setBest(Number(localStorage.getItem('pq_high') || 0)); setNick(localStorage.getItem('pq_nick') || ''); } catch { /* */ }
  }, []);

  /* ---------------- 게임 엔진 ---------------- */
  useEffect(() => {
    const cv = canvasRef.current!; const g = cv.getContext('2d')!;
    const W = cv.width, H = cv.height, ROAD_L = 120, ROAD_R = W - 120, LANES = 4, LW = (ROAD_R - ROAD_L) / LANES, PY = H - 60;
    const laneX = (i: number) => ROAD_L + LW * i + LW / 2;
    type Car = { x: number; y: number; v: number; c: [string, string] };
    let s = { lane: 1, x: laneX(1), cars: [] as Car[], coins: [] as { x: number; y: number }[], t: 0, speed: 200, scroll: 0, got: 0, nextCar: 30, nextCoin: 20 };
    let raf = 0, last = 0, running = false;
    const sfx = (n: Parameters<typeof retro.play>[0]) => retroRef.current.play(n);

    const car = (x: number, y: number, body: string, glass: string, oncoming: boolean) => {
      g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x - 13, y - 22, 32, 50);
      g.fillStyle = body; g.fillRect(x - 16, y - 26, 32, 52);
      g.fillStyle = '#000'; [[-19, -18], [16, -18], [-19, 10], [16, 10]].forEach(([dx, dy]) => g.fillRect(x + dx, y + dy, 3, 10));
      g.fillStyle = glass; g.fillRect(x - 11, oncoming ? y + 6 : y - 16, 22, 10);
      g.fillStyle = oncoming ? '#ef4444' : '#fef3c7';
      g.fillRect(x - 14, oncoming ? y + 22 : y - 26, 6, 4); g.fillRect(x + 8, oncoming ? y + 22 : y - 26, 6, 4);
    };
    const scene = () => {
      g.fillStyle = '#0f172a'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#1e1b4b'; g.fillRect(0, 0, ROAD_L, H); g.fillRect(ROAD_R, 0, W - ROAD_R, H);
      const off = s.scroll % 60;
      for (let y = -60; y < H + 60; y += 60) {
        g.fillStyle = '#312e81'; g.fillRect(10, y + off, 70, 44); g.fillRect(W - 80, y + off + 30, 70, 44);
        g.fillStyle = ((y / 60) & 1) ? '#fbbf24' : '#22d3ee';
        g.fillRect(18, y + off + 8, 8, 6); g.fillRect(44, y + off + 24, 8, 6); g.fillRect(W - 70, y + off + 40, 8, 6);
        g.fillStyle = '#ec4899'; g.fillRect(W - 44, y + off + 58, 8, 6);
      }
      g.fillStyle = '#ec4899'; g.fillRect(ROAD_L - 6, 0, 6, H);
      g.fillStyle = '#22d3ee'; g.fillRect(ROAD_R, 0, 6, H);
      g.fillStyle = '#1e293b'; g.fillRect(ROAD_L, 0, ROAD_R - ROAD_L, H);
      g.fillStyle = '#f59e0b';
      const lo = s.scroll % 40;
      for (let l = 1; l < LANES; l++) for (let y = -40 + lo; y < H; y += 40) g.fillRect(ROAD_L + LW * l - 2, y, 4, 20);
    };
    const points = () => Math.floor(s.t * 20) + s.got * 100;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      s.t += dt; s.speed = 200 + s.t * 9; s.scroll += s.speed * dt;
      s.x += (laneX(s.lane) - s.x) * Math.min(1, dt * 16);
      if (--s.nextCar <= 0) {
        const pal: [string, string][] = [['#ef4444', '#450a0a'], ['#3b82f6', '#0c1a3a'], ['#f97316', '#431407'], ['#a855f7', '#2e1065']];
        s.cars.push({ x: laneX(Math.floor(Math.random() * LANES)), y: -40, v: 60 + Math.random() * 80, c: pal[Math.floor(Math.random() * pal.length)] });
        s.nextCar = Math.max(22, 60 - s.t * 1.2) + Math.random() * 30;
      }
      if (--s.nextCoin <= 0) { s.coins.push({ x: laneX(Math.floor(Math.random() * LANES)), y: -20 }); s.nextCoin = 40 + Math.random() * 50; }
      for (const c of s.cars) {
        c.y += (s.speed - c.v) * dt;
        if (Math.abs(c.x - s.x) < 28 && Math.abs(c.y - PY) < 48) return over();
      }
      s.coins = s.coins.filter((c) => {
        c.y += s.speed * dt;
        if (Math.abs(c.x - s.x) < 26 && Math.abs(c.y - PY) < 34) { s.got++; sfx('coin'); return false; }
        return c.y < H + 20;
      });
      s.cars = s.cars.filter((c) => c.y < H + 60);

      scene();
      const flip = Math.floor(now / 120) % 2;
      for (const c of s.coins) {
        g.fillStyle = '#b45309'; g.fillRect(c.x - 8, c.y - 8, 16, 16);
        g.fillStyle = '#f59e0b'; g.fillRect(c.x - (flip ? 4 : 7), c.y - 7, flip ? 8 : 14, 14);
      }
      for (const c of s.cars) car(c.x, c.y, c.c[0], c.c[1], true);
      car(s.x, PY, '#10b981', '#0f172a', false);
      g.fillStyle = 'rgba(2,6,23,.75)'; g.fillRect(ROAD_L + 8, 8, 230, 30);
      g.fillStyle = '#fff'; g.font = '12px "Press Start 2P", monospace';
      g.fillText('SCORE ' + String(points()).padStart(5, '0'), ROAD_L + 16, 29);
      raf = requestAnimationFrame(tick);
    };
    const over = () => {
      running = false; cancelAnimationFrame(raf); sfx('crash');
      const r = { score: points(), coins: s.got, seconds: Math.round(s.t * 100) / 100 };
      if (s.got) retroRef.current.addCoins(s.got * 10);
      setBest((b) => { const n = Math.max(b, r.score); try { localStorage.setItem('pq_high', String(n)); } catch { /* */ } return n; });
      setRun(r); setSubmitted(null); setErr(''); setPhase('over');
    };
    startRef.current = () => {
      s = { lane: 1, x: laneX(1), cars: [], coins: [], t: 0, speed: 200, scroll: 0, got: 0, nextCar: 30, nextCoin: 20 };
      running = true; sfx('coin'); setPhase('playing');
      last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
    };
    moveRef.current = (d: number) => { if (running) { s.lane = Math.max(0, Math.min(LANES - 1, s.lane + d)); sfx('blip'); } };

    scene(); car(laneX(1), PY, '#10b981', '#0f172a', false);

    const held: Record<string, boolean> = {};
    const down = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).matches?.('input, textarea, select')) return;
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) { e.preventDefault(); if (!held.l) moveRef.current(-1); held.l = true; }
      if (['ArrowRight', 'd', 'D'].includes(e.key)) { e.preventDefault(); if (!held.r) moveRef.current(1); held.r = true; }
    };
    const up = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) held.l = false;
      if (['ArrowRight', 'd', 'D'].includes(e.key)) held.r = false;
    };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  const register = () => {
    if (!run) return;
    const name = nick.trim();
    if (!name) { setErr('닉네임을 적어 주세요'); return; }
    try { localStorage.setItem('pq_nick', name); } catch { /* */ }
    start(async () => {
      const r = await submitScore({ nickname: name, ...run });
      if (!r.ok) { setErr(r.error ?? '등록 실패'); return; }
      retro.play('level'); setSubmitted(r.value ?? -1); setErr('');
      router.refresh();
    });
  };

  const rank = run ? scores.filter((s) => s.score > run.score).length + 1 : 0;

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 p-4 border-2 border-pink-500 flex flex-wrap justify-between items-center gap-3">
        <div className="min-w-0">
          <h2 className="font-pixel text-sm text-pink-400 flex items-center gap-2"><i className="fa-solid fa-gamepad" /> NEON_CITY_RUNNER</h2>
          <p className="text-sm text-slate-400 mt-2">← → 또는 A / D로 차선을 바꿔요. 코인은 모으고 차는 피하세요. 모은 코인은 상단 점수에 쌓여요.</p>
        </div>
        <div className="font-pixel text-xs bg-slate-950 px-3 py-1.5 border border-pink-500 text-amber-400">MY BEST: {String(best).padStart(4, '0')}</div>
      </div>

      <div className="relative bg-black border-4 border-slate-700 rounded overflow-hidden flex justify-center">
        <canvas ref={canvasRef} width={600} height={400} aria-label="미니게임 화면"
          onPointerDown={(e) => { const r = e.currentTarget.getBoundingClientRect(); moveRef.current(e.clientX - r.left < r.width / 2 ? -1 : 1); }}
          className="w-full max-w-2xl h-auto bg-slate-950 block" style={{ aspectRatio: '3 / 2', touchAction: 'none' }} />
        {phase !== 'playing' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center gap-3">
            {phase === 'ready' ? (
              <>
                <h3 className="font-pixel text-base sm:text-xl text-amber-400 animate-pulse">NEON CITY RUNNER</h3>
                <p className="text-slate-300 text-sm max-w-sm">밤의 네온 시티를 질주하세요. 오래 버틸수록 점점 빨라져요.</p>
              </>
            ) : run && (
              <>
                <h3 className="font-pixel text-base sm:text-xl text-amber-400">GAME OVER</h3>
                <p className="font-pixel text-[10px] text-cyan-300">SCORE {run.score} · COIN ×{run.coins}</p>
                {submitted ? (
                  <p className="text-emerald-300 text-sm">랭킹에 등록했어요!{rank <= 10 ? ` 현재 ${rank}위예요.` : ''}</p>
                ) : run.score > 0 && (
                  <div className="flex flex-col items-center gap-2 w-full max-w-xs">
                    <label htmlFor="nick" className="text-sm text-slate-300">{rank <= 10 ? `TOP 10 진입! 예상 ${rank}위` : '랭킹에 기록을 남겨 보세요'}</label>
                    <div className="flex gap-2 w-full">
                      <input id="nick" value={nick} maxLength={12} onChange={(e) => setNick(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && register()}
                        placeholder="닉네임 (12자)" className="flex-1 min-w-0 bg-slate-950 border-2 border-slate-600 px-2 py-1.5 text-amber-300 font-pixel text-[10px] uppercase outline-none focus:border-amber-400" />
                      <button onClick={register} disabled={pending} className="btn-retro bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-[10px] px-3 border-2 border-amber-300 disabled:opacity-60">
                        {pending ? '...' : 'ENTER'}
                      </button>
                    </div>
                    {err && <p className="text-red-400 text-xs">{err}</p>}
                  </div>
                )}
              </>
            )}
            <button onClick={() => startRef.current()} className="btn-retro bg-pink-600 hover:bg-pink-500 text-white font-pixel text-sm px-6 py-3 border-2 border-pink-300 mt-1">
              {phase === 'ready' ? 'PRESS START' : 'CONTINUE?'}
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4 sm:hidden">
        <button onPointerDown={(e) => { e.preventDefault(); moveRef.current(-1); }} className="btn-retro bg-slate-800 text-amber-400 border-2 border-slate-600 w-20 h-14 text-2xl font-bold" aria-label="왼쪽">◄</button>
        <button onPointerDown={(e) => { e.preventDefault(); moveRef.current(1); }} className="btn-retro bg-slate-800 text-amber-400 border-2 border-slate-600 w-20 h-14 text-2xl font-bold" aria-label="오른쪽">►</button>
      </div>

      <div className="pixel-box p-4 border-amber-600 bg-slate-900">
        <h3 className="font-pixel text-xs text-amber-400 mb-3 flex items-center gap-2"><i className="fa-solid fa-trophy" /> HALL_OF_FAME · TOP 10</h3>
        {scores.length ? (
          <ol className="divide-y divide-slate-800">
            {scores.map((s, i) => (
              <li key={s.id} className={`flex items-center gap-3 py-2 ${s.id === submitted ? 'bg-amber-500/10' : ''}`}>
                <span className={`font-pixel text-[10px] w-10 shrink-0 ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-400' : 'text-slate-500'}`}>
                  {i < 3 ? ['1ST', '2ND', '3RD'][i] : `${i + 1}TH`}
                </span>
                <span className="font-pixel text-[10px] text-slate-100 flex-1 truncate uppercase">{s.nickname}</span>
                <span className="font-term text-lg text-amber-300 tabular-nums">{String(s.score).padStart(5, '0')}</span>
                <span className="font-term text-base text-slate-500 w-14 text-right hidden sm:inline">×{s.coins}</span>
              </li>
            ))}
          </ol>
        ) : <p className="text-sm text-slate-400">아직 기록이 없어요. 첫 번째 주인공이 되어 보세요!</p>}
      </div>
    </div>
  );
}
