// 카테고리 색상 프리셋. Tailwind가 클래스를 찾을 수 있도록 전체 문자열로 적어 둠.
export const CATEGORY_COLORS = {
  amber:   { label: '골드',   text: 'text-amber-300',   badge: 'bg-amber-900/70 text-amber-200 border-amber-500',     hover: 'hover:bg-amber-600 hover:text-slate-950',   ring: 'ring-amber-400',   swatch: 'bg-amber-400' },
  cyan:    { label: '시안',   text: 'text-cyan-300',    badge: 'bg-cyan-900/70 text-cyan-200 border-cyan-500',        hover: 'hover:bg-cyan-600 hover:text-slate-950',    ring: 'ring-cyan-400',    swatch: 'bg-cyan-400' },
  pink:    { label: '핑크',   text: 'text-pink-300',    badge: 'bg-pink-900/70 text-pink-200 border-pink-500',        hover: 'hover:bg-pink-600 hover:text-white',        ring: 'ring-pink-400',    swatch: 'bg-pink-400' },
  emerald: { label: '그린',   text: 'text-emerald-300', badge: 'bg-emerald-900/70 text-emerald-200 border-emerald-500', hover: 'hover:bg-emerald-600 hover:text-slate-950', ring: 'ring-emerald-400', swatch: 'bg-emerald-400' },
  purple:  { label: '퍼플',   text: 'text-purple-300',  badge: 'bg-purple-900/70 text-purple-200 border-purple-500',  hover: 'hover:bg-purple-600 hover:text-white',      ring: 'ring-purple-400',  swatch: 'bg-purple-400' },
  red:     { label: '레드',   text: 'text-red-300',     badge: 'bg-red-900/80 text-red-300 border-red-600',           hover: 'hover:bg-red-600 hover:text-white',         ring: 'ring-red-400',     swatch: 'bg-red-400' },
  blue:    { label: '블루',   text: 'text-blue-300',    badge: 'bg-blue-900/70 text-blue-200 border-blue-500',        hover: 'hover:bg-blue-600 hover:text-white',        ring: 'ring-blue-400',    swatch: 'bg-blue-400' }
} as const;

export type ColorKey = keyof typeof CATEGORY_COLORS;
export const colorOf = (c?: string | null) => CATEGORY_COLORS[(c as ColorKey)] ?? CATEGORY_COLORS.amber;
