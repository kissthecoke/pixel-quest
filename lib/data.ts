import 'server-only';
import { IS_DEMO } from './supabase/config';
import { createPublicClient, createSessionClient } from './supabase/server';
import { demoCategories, demoPosts, demoProfile, demoMessages, demoScores } from './demo';
import type { Category, Post, Profile, Message, Score } from './types';

const POST_COLS = 'id,title,slug,summary,content,icon,category_id,status,published_at,likes,created_at,updated_at';

function attach(posts: Post[], cats: Category[]): Post[] {
  return posts.map((p) => ({ ...p, category: cats.find((c) => c.id === p.category_id) ?? null }));
}

/* ---------------- 방문자용 ---------------- */

export async function getCategories(): Promise<Category[]> {
  if (IS_DEMO) return demoCategories;
  const { data } = await createPublicClient().from('categories').select('*').order('sort_order').order('created_at');
  return (data as Category[]) ?? [];
}

export async function getPublishedPosts(): Promise<Post[]> {
  const cats = await getCategories();
  if (IS_DEMO) return attach(demoPosts.filter((p) => p.status === 'published'), cats);
  const { data } = await createPublicClient()
    .from('posts').select(POST_COLS)
    .eq('status', 'published').lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false });
  return attach((data as Post[]) ?? [], cats);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const cats = await getCategories();
  if (IS_DEMO) {
    const p = demoPosts.find((x) => x.slug === slug && x.status === 'published');
    return p ? attach([p], cats)[0] : null;
  }
  const { data } = await createPublicClient()
    .from('posts').select(POST_COLS)
    .eq('slug', slug).eq('status', 'published').lte('published_at', new Date().toISOString())
    .maybeSingle();
  return data ? attach([data as Post], cats)[0] : null;
}

export async function getProfile(): Promise<Profile> {
  if (IS_DEMO) return demoProfile;
  const { data } = await createPublicClient().from('profile').select('*').eq('id', 1).maybeSingle();
  return (data as Profile) ?? demoProfile;
}

export async function getTopScores(limit = 10): Promise<Score[]> {
  if (IS_DEMO) return demoScores.slice(0, limit);
  const { data } = await createPublicClient().rpc('top_scores', { p_limit: limit });
  return (data as Score[]) ?? [];
}

/* ---------------- 관리자용 (로그인 세션 필요, RLS로 보호) ---------------- */

export type AdminState = { ok: boolean; demo: boolean; email: string | null };

export async function getAdminState(): Promise<AdminState> {
  if (IS_DEMO) return { ok: true, demo: true, email: 'demo@pixel.quest' };
  const sb = await createSessionClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { ok: false, demo: false, email: null };
  const { data: isAdmin } = await sb.rpc('is_admin');
  return { ok: !!isAdmin, demo: false, email: user.email ?? null };
}

export async function adminGetPosts(): Promise<Post[]> {
  const cats = await adminGetCategories();
  if (IS_DEMO) return attach(demoPosts, cats);
  const sb = await createSessionClient();
  const { data } = await sb.from('posts').select(POST_COLS).order('created_at', { ascending: false });
  return attach((data as Post[]) ?? [], cats);
}

export async function adminGetPost(id: string): Promise<Post | null> {
  if (IS_DEMO) return demoPosts.find((p) => p.id === id) ?? null;
  const sb = await createSessionClient();
  const { data } = await sb.from('posts').select(POST_COLS).eq('id', id).maybeSingle();
  return (data as Post) ?? null;
}

export async function adminGetCategories(): Promise<Category[]> {
  if (IS_DEMO) return demoCategories;
  const sb = await createSessionClient();
  const { data } = await sb.from('categories').select('*').order('sort_order').order('created_at');
  return (data as Category[]) ?? [];
}

export async function adminGetMessages(): Promise<Message[]> {
  if (IS_DEMO) return demoMessages;
  const sb = await createSessionClient();
  const { data } = await sb.from('messages').select('id,name,email,body,is_read,created_at').order('created_at', { ascending: false });
  return (data as Message[]) ?? [];
}

export async function adminGetScores(): Promise<Score[]> {
  if (IS_DEMO) return demoScores;
  const sb = await createSessionClient();
  const { data } = await sb.from('game_scores').select('id,nickname,score,coins,created_at').order('score', { ascending: false }).limit(200);
  return (data as Score[]) ?? [];
}
