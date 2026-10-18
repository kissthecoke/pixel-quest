// 관리자 화면 공통 조각
export function PageHead({ title, ko, children }: { title: string; ko: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-4 border-2 border-slate-700">
      <div>
        <h1 className="font-pixel text-sm text-amber-400">{title}</h1>
        <p className="text-sm text-slate-400 mt-1">{ko}</p>
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
export const inputCls = 'w-full bg-slate-950 border-2 border-slate-700 px-2.5 py-2 text-slate-100 focus:border-emerald-500 outline-none';
export const labelCls = 'block text-xs font-title text-slate-400 mb-2';
export const btn = {
  primary: 'btn-retro bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-pixel text-[10px] px-4 py-2.5 border-2 border-emerald-300 disabled:opacity-50',
  gold: 'btn-retro bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-[10px] px-4 py-2.5 border-2 border-amber-300 disabled:opacity-50',
  ghost: 'btn-retro bg-slate-800 hover:bg-slate-700 text-slate-300 font-pixel text-[10px] px-3 py-2 border-2 border-slate-600 disabled:opacity-50',
  danger: 'btn-retro bg-red-900/60 hover:bg-red-800 text-red-200 font-pixel text-[10px] px-3 py-2 border-2 border-red-600 disabled:opacity-50'
};
