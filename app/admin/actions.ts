'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { IS_DEMO } from '@/lib/supabase/config';
import { createSessionClient } from '@/lib/supabase/server';
import type { Skill, Social } from '@/lib/types';

export type Res = { ok: boolean; error?: string; id?: string; url?: string };
const DEMO_ERR: Res = { ok: false, error: '데모 모드에서는 저장되지 않아요. Supabase를 연결해 주세요.' };

async function admin() {
  const sb = await createSessionClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error('로그인이 필요해요');
  const { data: ok } = await sb.rpc('is_admin');
  if (!ok) throw new Error('관리자 권한이 없어요');
  return sb;
}

const refresh = () => revalidatePath('/', 'layout');
const fail = (e: unknown, fallback: string): Res => {
  const m = e instanceof Error ? e.message : String((e as any)?.message ?? '');
  if (m.includes('duplicate key') && m.includes('slug')) return { ok: false, error: '같은 주소(slug)를 쓰는 항목이 이미 있어요' };
  if (m.includes('check constraint')) return { ok: false, error: '입력값을 확인해 주세요 (글자 수나 형식)' };
  return { ok: false, error: m || fallback };
};

export const makeSlug = async (s: string) =>
  s.toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 100);

/* ---------------- 글 ---------------- */
export type PostInput = {
  id?: string; title: string; slug: string; summary: string; content: string; icon: string;
  category_id: string | null; status: 'draft' | 'published'; published_at: string | null;
};

export async function savePost(input: PostInput): Promise<Res> {
  if (IS_DEMO) return DEMO_ERR;
  try {
    const sb = await admin();
    const title = input.title.trim();
    if (!title) return { ok: false, error: '제목을 적어 주세요' };
    const slug = (await makeSlug(input.slug || title)) || `post-${Date.now()}`;
    const row = {
      title, slug, summary: input.summary.trim(), content: input.content, icon: input.icon.trim() || '🎮',
      category_id: input.category_id || null, status: input.status,
      published_at: input.status === 'published' ? (input.published_at || new Date().toISOString()) : input.published_at
    };
    const q = input.id ? sb.from('posts').update(row).eq('id', input.id).select('id').single()
                       : sb.from('posts').insert(row).select('id').single();
    const { data, error } = await q;
    if (error) return fail(error, '글을 저장하지 못했어요');
    refresh();
    return { ok: true, id: data.id };
  } catch (e) { return fail(e, '글을 저장하지 못했어요'); }
}

export async function deletePost(id: string): Promise<Res> {
  if (IS_DEMO) return DEMO_ERR;
  try {
    const sb = await admin();
    const { error } = await sb.from('posts').delete().eq('id', id);
    if (error) return fail(error, '삭제하지 못했어요');
    refresh();
    return { ok: true };
  } catch (e) { return fail(e, '삭제하지 못했어요'); }
}

export async function uploadImage(form: FormData): Promise<Res> {
  if (IS_DEMO) return DEMO_ERR;
  try {
    const sb = await admin();
    const file = form.get('file') as File | null;
    if (!file || !file.size) return { ok: false, error: '파일을 골라 주세요' };
    if (!file.type.startsWith('image/')) return { ok: false, error: '이미지 파일만 올릴 수 있어요' };
    if (file.size > 5 * 1024 * 1024) return { ok: false, error: '5MB 이하 이미지만 올릴 수 있어요' };
    const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '');
    const path = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`;
    const { error } = await sb.storage.from('post-images').upload(path, file, { contentType: file.type });
    if (error) return fail(error, '이미지를 올리지 못했어요');
    const { data } = sb.storage.from('post-images').getPublicUrl(path);
    return { ok: true, url: data.publicUrl };
  } catch (e) { return fail(e, '이미지를 올리지 못했어요'); }
}

/* ---------------- 카테고리 ---------------- */
export type CategoryInput = { id?: string; name: string; slug: string; color: string; icon: string; sort_order: number };

export async function saveCategory(input: CategoryInput): Promise<Res> {
  if (IS_DEMO) return DEMO_ERR;
  try {
    const sb = await admin();
    const name = input.name.trim();
    const slug = input.slug.trim().toLowerCase();
    if (!name) return { ok: false, error: '이름을 적어 주세요' };
    if (!/^[a-z0-9-]{1,40}$/.test(slug)) return { ok: false, error: '주소(slug)는 영문 소문자, 숫자, - 만 쓸 수 있어요' };
    const row = { name, slug, color: input.color, icon: input.icon.trim() || '🎮', sort_order: input.sort_order };
    const { data, error } = input.id
      ? await sb.from('categories').update(row).eq('id', input.id).select('id').single()
      : await sb.from('categories').insert(row).select('id').single();
    if (error) return fail(error, '카테고리를 저장하지 못했어요');
    refresh();
    return { ok: true, id: data.id };
  } catch (e) { return fail(e, '카테고리를 저장하지 못했어요'); }
}

export async function deleteCategory(id: string): Promise<Res> {
  if (IS_DEMO) return DEMO_ERR;
  try {
    const sb = await admin();
    const { error } = await sb.from('categories').delete().eq('id', id);
    if (error) return fail(error, '삭제하지 못했어요');
    refresh();
    return { ok: true };
  } catch (e) { return fail(e, '삭제하지 못했어요'); }
}

export async function reorderCategories(ids: string[]): Promise<Res> {
  if (IS_DEMO) return DEMO_ERR;
  try {
    const sb = await admin();
    for (let i = 0; i < ids.length; i++) {
      const { error } = await sb.from('categories').update({ sort_order: i + 1 }).eq('id', ids[i]);
      if (error) return fail(error, '순서를 바꾸지 못했어요');
    }
    refresh();
    return { ok: true };
  } catch (e) { return fail(e, '순서를 바꾸지 못했어요'); }
}

/* ---------------- 편지함 ---------------- */
export async function setMessageRead(id: string, is_read: boolean): Promise<Res> {
  if (IS_DEMO) return DEMO_ERR;
  try {
    const sb = await admin();
    const { error } = await sb.from('messages').update({ is_read }).eq('id', id);
    if (error) return fail(error, '바꾸지 못했어요');
    revalidatePath('/admin', 'layout');
    return { ok: true };
  } catch (e) { return fail(e, '바꾸지 못했어요'); }
}

export async function deleteMessage(id: string): Promise<Res> {
  if (IS_DEMO) return DEMO_ERR;
  try {
    const sb = await admin();
    const { error } = await sb.from('messages').delete().eq('id', id);
    if (error) return fail(error, '삭제하지 못했어요');
    revalidatePath('/admin', 'layout');
    return { ok: true };
  } catch (e) { return fail(e, '삭제하지 못했어요'); }
}

/* ---------------- 랭킹 ---------------- */
export async function deleteScore(id: number): Promise<Res> {
  if (IS_DEMO) return DEMO_ERR;
  try {
    const sb = await admin();
    const { error } = await sb.from('game_scores').delete().eq('id', id);
    if (error) return fail(error, '삭제하지 못했어요');
    revalidatePath('/arcade'); revalidatePath('/admin', 'layout');
    return { ok: true };
  } catch (e) { return fail(e, '삭제하지 못했어요'); }
}

/* ---------------- 프로필 ---------------- */
export type ProfileInput = { name: string; bio: string; class_label: string; alignment: string; location: string; skills: Skill[]; socials: Social[] };

export async function saveProfile(input: ProfileInput): Promise<Res> {
  if (IS_DEMO) return DEMO_ERR;
  try {
    const sb = await admin();
    const row = {
      name: input.name.trim() || 'PLAYER_1', bio: input.bio.trim(), class_label: input.class_label.trim(),
      alignment: input.alignment.trim(), location: input.location.trim(),
      skills: input.skills.filter((s) => s.name.trim()).map((s) => ({ name: s.name.trim(), level: Math.max(0, Math.min(99, Math.round(Number(s.level) || 0))) })),
      socials: input.socials.filter((s) => s.url.trim()).map((s) => ({ label: s.label.trim(), handle: s.handle.trim(), url: s.url.trim(), icon: s.icon.trim() })),
      updated_at: new Date().toISOString()
    };
    if (row.socials.some((s) => !/^https?:\/\//i.test(s.url))) return { ok: false, error: '링크 주소는 https:// 로 시작해야 해요' };
    const { error } = await sb.from('profile').update(row).eq('id', 1);
    if (error) return fail(error, '프로필을 저장하지 못했어요');
    refresh();
    return { ok: true };
  } catch (e) { return fail(e, '프로필을 저장하지 못했어요'); }
}

/* ---------------- 로그아웃 ---------------- */
export async function signOut() {
  if (!IS_DEMO) {
    const sb = await createSessionClient();
    await sb.auth.signOut();
  }
  redirect('/admin/login');
}
