-- =====================================================================
--  PIXEL QUEST · Supabase 설치 스크립트
--  Supabase 대시보드 > SQL Editor 에 전체를 붙여넣고 RUN 하세요.
--  여러 번 실행해도 안전하게 만들었어요.
--  ⚠️ 맨 아래 "관리자 이메일" 부분을 본인 이메일로 바꾼 뒤 실행하세요.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- 관리자 ----------
create table if not exists public.app_admins (
  email text primary key
);
alter table public.app_admins enable row level security;
-- 정책 없음 = 누구도 API로 읽거나 쓸 수 없음 (SQL Editor 에서만 관리)

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.app_admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ---------- 카테고리 ----------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 30),
  slug text not null unique check (slug ~ '^[a-z0-9-]{1,40}$'),
  color text not null default 'amber',
  icon text not null default '🎮',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- 글 ----------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  slug text not null unique check (char_length(slug) between 1 and 120),
  summary text not null default '' check (char_length(summary) <= 300),
  content text not null default '',
  icon text not null default '🎮',
  category_id uuid references public.categories(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  likes int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists posts_published_idx on public.posts (status, published_at desc);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists posts_touch on public.posts;
create trigger posts_touch before update on public.posts
  for each row execute function public.touch_updated_at();

-- ---------- 좋아요 (방문자당 글 하나에 한 번) ----------
create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  visitor_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (post_id, visitor_id)
);

-- ---------- 편지함 ----------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 40),
  email text not null default '' check (char_length(email) <= 120),
  body text not null check (char_length(body) between 1 and 3000),
  visitor_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- 프로필 (한 줄만 존재) ----------
create table if not exists public.profile (
  id int primary key default 1 check (id = 1),
  name text not null default 'PIXEL_DEVELOPER',
  bio text not null default '',
  class_label text not null default 'TECH_WIZARD',
  alignment text not null default 'CHAOTIC_GOOD',
  location text not null default 'NEO-SEOUL 2088',
  skills jsonb not null default '[]'::jsonb,
  socials jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------- 게임 랭킹 ----------
create table if not exists public.game_scores (
  id bigint generated always as identity primary key,
  nickname text not null check (char_length(nickname) between 1 and 12),
  score int not null check (score between 0 and 1000000),
  coins int not null default 0 check (coins >= 0),
  visitor_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists game_scores_top_idx on public.game_scores (score desc);

-- API 접근 권한 (실제 허용 범위는 아래 RLS 규칙이 결정)
grant usage on schema public to anon, authenticated;
grant select on public.categories, public.posts, public.profile to anon;
grant select, insert, update, delete on public.categories, public.posts, public.messages, public.profile, public.game_scores to authenticated;

-- =====================================================================
--  보안 규칙 (Row Level Security)
-- =====================================================================
alter table public.categories  enable row level security;
alter table public.posts       enable row level security;
alter table public.post_likes  enable row level security;
alter table public.messages    enable row level security;
alter table public.profile     enable row level security;
alter table public.game_scores enable row level security;

drop policy if exists "categories read"  on public.categories;
drop policy if exists "categories admin" on public.categories;
create policy "categories read"  on public.categories for select using (true);
create policy "categories admin" on public.categories for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "posts read"  on public.posts;
drop policy if exists "posts admin" on public.posts;
create policy "posts read" on public.posts for select
  using ((status = 'published' and published_at <= now()) or public.is_admin());
create policy "posts admin" on public.posts for all using (public.is_admin()) with check (public.is_admin());

-- post_likes: 정책 없음 → like_post() 함수로만 접근

drop policy if exists "messages admin" on public.messages;
create policy "messages admin" on public.messages for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "profile read"  on public.profile;
drop policy if exists "profile admin" on public.profile;
create policy "profile read"  on public.profile for select using (true);
create policy "profile admin" on public.profile for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "scores read"   on public.game_scores;
drop policy if exists "scores delete" on public.game_scores;
-- 방문자는 top_scores() 함수로만 랭킹을 봄 (visitor_id 는 숨김)
create policy "scores read"   on public.game_scores for select using (public.is_admin());
create policy "scores delete" on public.game_scores for delete using (public.is_admin());

-- =====================================================================
--  방문자용 함수 (검증 포함)
-- =====================================================================

-- 좋아요: 같은 방문자는 한 번만. 새 좋아요 수를 돌려줌
create or replace function public.like_post(p_post uuid, p_visitor uuid)
returns int language plpgsql security definer set search_path = public as $$
declare n int; inserted int;
begin
  if not exists (select 1 from posts where id = p_post and status = 'published' and published_at <= now()) then
    raise exception 'post not found';
  end if;
  insert into post_likes (post_id, visitor_id) values (p_post, p_visitor) on conflict do nothing;
  get diagnostics inserted = row_count;
  if inserted > 0 then
    update posts set likes = likes + 1 where id = p_post returning likes into n;
  else
    select likes into n from posts where id = p_post;
  end if;
  return n;
end; $$;

-- 편지 보내기: 같은 방문자는 10분에 3통까지
create or replace function public.send_message(p_name text, p_email text, p_body text, p_visitor uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from messages where visitor_id = p_visitor and created_at > now() - interval '10 minutes') >= 3 then
    raise exception 'rate limited';
  end if;
  insert into messages (name, email, body, visitor_id)
  values (trim(p_name), trim(coalesce(p_email, '')), trim(p_body), p_visitor);
end; $$;

-- 점수 등록: 플레이 시간으로 가능한 최대 점수를 넘으면 거부, 5초에 한 번
--   게임 점수 = 버틴 초 × 20 + 코인 × 100
create or replace function public.submit_score(p_nickname text, p_score int, p_coins int, p_seconds numeric, p_visitor uuid)
returns bigint language plpgsql security definer set search_path = public as $$
declare new_id bigint; nick text := trim(p_nickname);
begin
  if char_length(nick) < 1 or char_length(nick) > 12 then raise exception 'bad nickname'; end if;
  if p_seconds <= 0 or p_seconds > 3600 or p_coins < 0 or p_coins > p_seconds * 3 then raise exception 'bad run'; end if;
  if p_score > p_seconds * 20 + p_coins * 100 + 50 then raise exception 'bad score'; end if;
  if exists (select 1 from game_scores where visitor_id = p_visitor and created_at > now() - interval '5 seconds') then
    raise exception 'rate limited';
  end if;
  insert into game_scores (nickname, score, coins, visitor_id) values (nick, p_score, p_coins, p_visitor)
  returning id into new_id;
  return new_id;
end; $$;

-- 랭킹 TOP N
create or replace function public.top_scores(p_limit int default 10)
returns table (id bigint, nickname text, score int, coins int, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select id, nickname, score, coins, created_at from game_scores
  order by score desc, created_at asc
  limit least(greatest(p_limit, 1), 50);
$$;

grant execute on function public.top_scores(int) to anon, authenticated;
grant execute on function public.like_post(uuid, uuid) to anon, authenticated;
grant execute on function public.send_message(text, text, text, uuid) to anon, authenticated;
grant execute on function public.submit_score(text, int, int, numeric, uuid) to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- =====================================================================
--  이미지 저장소 (글 이미지)
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

drop policy if exists "post images admin insert" on storage.objects;
drop policy if exists "post images admin update" on storage.objects;
drop policy if exists "post images admin delete" on storage.objects;
create policy "post images admin insert" on storage.objects for insert
  with check (bucket_id = 'post-images' and public.is_admin());
create policy "post images admin update" on storage.objects for update
  using (bucket_id = 'post-images' and public.is_admin());
create policy "post images admin delete" on storage.objects for delete
  using (bucket_id = 'post-images' and public.is_admin());

-- =====================================================================
--  기본 데이터
-- =====================================================================
insert into public.profile (id, name, bio, skills, socials) values (
  1, 'PIXEL_DEVELOPER',
  '레트로 게임을 좋아하는 웹 개발자입니다. 도트 감성과 요즘 웹 기술을 섞어서, 오래 머물고 싶은 작은 디지털 공간을 만듭니다.',
  '[{"name":"JavaScript / TypeScript","level":95},{"name":"React / Tailwind","level":90},{"name":"픽셀 아트 · 게임 디자인","level":82},{"name":"백엔드 · 데이터베이스","level":88}]',
  '[{"label":"GITHUB","handle":"@kissthecoke","url":"https://github.com/kissthecoke","icon":"fa-brands fa-github"},{"label":"TWITTER / X","handle":"@pixel_quest","url":"https://x.com","icon":"fa-brands fa-x-twitter"}]'
) on conflict (id) do nothing;

insert into public.categories (name, slug, color, icon, sort_order) values
  ('개발 · 기술', 'tech', 'cyan', '⚡', 1),
  ('픽셀 아트', 'pixel', 'pink', '🎨', 2),
  ('일상 · 생각', 'life', 'emerald', '☕', 3)
on conflict (slug) do nothing;

insert into public.posts (title, slug, summary, content, icon, category_id, status, published_at, likes)
select * from (values
  ('네온 시티에 오신 걸 환영해요', 'welcome-to-neo-city',
   'Next.js와 Supabase로 오락실 감성 홈페이지를 만든 과정을 정리했어요.',
   E'여기는 제 개인 디지털 놀이터예요.\n\n주사선 효과, 경험치 바, 인벤토리 아카이브, 효과음까지 전부 16비트 콘솔 화면을 떠올리며 디자인했어요. 퀘스트 로그에서 글을 둘러보거나 **ARCADE_ZONE**에서 미니게임 랭킹에 도전해 보세요.',
   '🕹️', (select id from public.categories where slug = 'tech'), 'published', now() - interval '1 day', 0),
  ('도트가 뭉개지지 않게: 선명한 픽셀 아트 렌더링', 'crisp-pixel-art',
   'CSS image-rendering 속성과 팔레트 선택으로 스프라이트를 또렷하게 보여주는 방법.',
   E'브라우저는 이미지를 확대할 때 기본으로 부드럽게 보간해서, 작은 도트 이미지가 흐릿해져요.\n\n`image-rendering: pixelated`를 주면 픽셀 하나하나가 네모난 그대로 커져요.\n\n## 팁\n\n- PICO-8이나 NES처럼 팔레트를 16색, 32색으로 제한해 보세요.\n- 확대는 정수 배율(2배, 3배)로 하세요.',
   '🎨', (select id from public.categories where slug = 'pixel'), 'published', now() - interval '3 days', 0)
) as v(title, slug, summary, content, icon, category_id, status, published_at, likes)
on conflict (slug) do nothing;

-- =====================================================================
--  ⚠️ 관리자 이메일: 아래 주소를 Supabase 에서 만든 관리자 계정 이메일로 바꾸세요.
-- =====================================================================
insert into public.app_admins (email) values ('YOUR_EMAIL@example.com')
on conflict do nothing;
