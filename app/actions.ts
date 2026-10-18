'use server';
import { revalidatePath } from 'next/cache';
import { IS_DEMO } from '@/lib/supabase/config';
import { createPublicClient } from '@/lib/supabase/server';
import { getVisitorId } from '@/lib/visitor';

export type ActionResult = { ok: boolean; error?: string; value?: number };

export async function likePost(postId: string): Promise<ActionResult> {
  if (IS_DEMO) return { ok: false, error: '데모 모드에서는 저장되지 않아요' };
  const vid = await getVisitorId();
  const { data, error } = await createPublicClient().rpc('like_post', { p_post: postId, p_visitor: vid });
  if (error) return { ok: false, error: '좋아요를 저장하지 못했어요' };
  revalidatePath('/', 'layout');
  return { ok: true, value: data as number };
}

export async function sendMessage(form: { name: string; email: string; body: string; website?: string }): Promise<ActionResult> {
  if (form.website) return { ok: true }; // 스팸봇용 숨은 칸
  const name = (form.name || '').trim(), body = (form.body || '').trim(), email = (form.email || '').trim();
  if (!name || !body) return { ok: false, error: '이름과 내용을 적어 주세요' };
  if (name.length > 40 || body.length > 3000 || email.length > 120) return { ok: false, error: '글자 수가 너무 많아요' };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: '이메일 형식을 확인해 주세요' };
  if (IS_DEMO) return { ok: false, error: '데모 모드에서는 편지가 저장되지 않아요' };
  const vid = await getVisitorId();
  const { error } = await createPublicClient().rpc('send_message', { p_name: name, p_email: email, p_body: body, p_visitor: vid });
  if (error) return { ok: false, error: error.message.includes('rate') ? '잠시 후에 다시 보내 주세요' : '편지를 보내지 못했어요' };
  return { ok: true };
}

export async function submitScore(run: { nickname: string; score: number; coins: number; seconds: number }): Promise<ActionResult> {
  const nickname = (run.nickname || '').trim().slice(0, 12);
  if (!nickname) return { ok: false, error: '닉네임을 적어 주세요' };
  if (IS_DEMO) return { ok: false, error: '데모 모드에서는 랭킹에 저장되지 않아요' };
  const vid = await getVisitorId();
  const { data, error } = await createPublicClient().rpc('submit_score', {
    p_nickname: nickname, p_score: Math.floor(run.score), p_coins: Math.floor(run.coins), p_seconds: run.seconds, p_visitor: vid
  });
  if (error) return { ok: false, error: error.message.includes('rate') ? '잠시 후에 다시 등록해 주세요' : '점수를 등록하지 못했어요' };
  revalidatePath('/arcade');
  return { ok: true, value: data as number };
}
