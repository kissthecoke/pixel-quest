'use client';
import { useState, useTransition } from 'react';
import { likePost } from '@/app/actions';
import { useRetro } from './RetroProvider';

export default function LikeButton({ postId, initial }: { postId: string; initial: number }) {
  const [likes, setLikes] = useState(initial);
  const [pending, start] = useTransition();
  const { play, addCoins, toast } = useRetro();

  const onClick = () => start(async () => {
    const r = await likePost(postId);
    if (!r.ok) { toast(r.error ?? '오류'); return; }
    if ((r.value ?? likes) > likes) { play('coin'); addCoins(10); toast('HP +1 · COIN +10'); }
    else toast('이미 응원했어요!');
    setLikes(r.value ?? likes);
  });

  return (
    <button onClick={onClick} disabled={pending}
      className="btn-retro px-3 py-1.5 bg-red-900/60 hover:bg-red-800 border border-red-500 text-red-300 font-pixel text-xs flex items-center gap-2 disabled:opacity-60">
      <i className="fa-solid fa-heart text-red-500" /> HP +{likes}
    </button>
  );
}
