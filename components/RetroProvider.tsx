'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

/* ---------------- 효과음 엔진 (Web Audio) ---------------- */
let audioCtx: AudioContext | null = null;
function getCtx() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}
export function tone(freq: number, dur: number, type: OscillatorType = 'square', vol = 0.12, at = 0, slide?: number) {
  try {
    const ctx = getCtx(); if (!ctx) return;
    const t = ctx.currentTime + at, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + dur + 0.02);
  } catch { /* 소리 재생 불가 환경 */ }
}

export type SoundName = 'blip' | 'coin' | 'open' | 'type' | 'crash' | 'level';
function sfx(name: SoundName) {
  switch (name) {
    case 'blip': return tone(440, 0.08, 'square', 0.12, 0, 880);
    case 'coin': tone(987.77, 0.08, 'square', 0.15); return tone(1318.51, 0.22, 'square', 0.15, 0.08);
    case 'open': return tone(300, 0.12, 'triangle', 0.2, 0, 600);
    case 'type': return tone(700 + Math.random() * 140, 0.025, 'square', 0.03);
    case 'crash': tone(220, 0.4, 'sawtooth', 0.18, 0, 40); return tone(110, 0.5, 'square', 0.1, 0.05, 30);
    case 'level': [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.14, 'square', 0.1, i * 0.1));
  }
}

/* ---------------- 저장 도우미 ---------------- */
const load = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const save = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 저장 불가 */ } };

/* ---------------- 컨텍스트 ---------------- */
type Retro = {
  soundOn: boolean; toggleSound: () => void;
  crtOn: boolean; toggleCrt: () => void;
  coins: number; level: number; addCoins: (n: number) => void;
  play: (n: SoundName) => void;
  toast: (msg: string) => void;
};
const Ctx = createContext<Retro | null>(null);
export const useRetro = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('RetroProvider missing');
  return c;
};

export const levelOf = (c: number) => Math.min(99, Math.floor(c / 1000) + 1);

export default function RetroProvider({ children }: { children: React.ReactNode }) {
  const [soundOn, setSoundOn] = useState(true);
  const [crtOn, setCrtOn] = useState(true);
  const [coins, setCoins] = useState(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const soundRef = useRef(true);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const s = load('pq_sound', true); setSoundOn(s); soundRef.current = s;
    setCrtOn(load('pq_crt', true));
    setCoins(load('pq_coins', 0));
  }, []);

  const play = useCallback((n: SoundName) => { if (soundRef.current) sfx(n); }, []);
  const toast = useCallback((msg: string) => {
    setToastMsg(msg); clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 1800);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundOn((v) => { const n = !v; soundRef.current = n; save('pq_sound', n); if (n) sfx('blip'); return n; });
  }, []);
  const toggleCrt = useCallback(() => { setCrtOn((v) => { save('pq_crt', !v); return !v; }); play('blip'); }, [play]);

  const addCoins = useCallback((n: number) => {
    setCoins((c) => {
      const next = c + n; save('pq_coins', next);
      if (levelOf(next) > levelOf(c)) { setTimeout(() => { play('level'); toast(`LEVEL UP! LV ${String(levelOf(next)).padStart(2, '0')}`); }, 0); }
      return next;
    });
  }, [play, toast]);

  return (
    <Ctx.Provider value={{ soundOn, toggleSound, crtOn, toggleCrt, coins, level: levelOf(coins), addCoins, play, toast }}>
      <div className={`min-h-screen flex flex-col ${crtOn ? 'crt-overlay' : ''}`}>{children}</div>
      {toastMsg && (
        <div role="status" className="fixed left-1/2 -translate-x-1/2 z-[60] bg-slate-950 border-2 border-amber-400 text-amber-400 font-pixel text-[10px] px-4 py-3 whitespace-nowrap"
          style={{ bottom: 'calc(20px + env(safe-area-inset-bottom, 0px))' }}>{toastMsg}</div>
      )}
    </Ctx.Provider>
  );
}
