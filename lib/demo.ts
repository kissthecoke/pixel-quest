// Supabase 연결 전(데모 모드)에 화면을 보여주기 위한 예시 데이터
import type { Category, Post, Profile, Message, Score } from './types';

const day = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

export const demoCategories: Category[] = [
  { id: 'c-tech', name: '개발 · 기술', slug: 'tech', color: 'cyan', icon: '⚡', sort_order: 1 },
  { id: 'c-pixel', name: '픽셀 아트', slug: 'pixel', color: 'pink', icon: '🎨', sort_order: 2 },
  { id: 'c-life', name: '일상 · 생각', slug: 'life', color: 'emerald', icon: '☕', sort_order: 3 }
];

export const demoPosts: Post[] = [
  {
    id: 'p1', slug: 'welcome-to-neo-city', icon: '🕹️', category_id: 'c-tech', status: 'published', likes: 42,
    published_at: day(1), created_at: day(1), updated_at: day(1),
    title: '네온 시티에 오신 걸 환영해요',
    summary: 'Next.js와 Supabase로 오락실 감성 홈페이지를 만든 과정을 정리했어요.',
    content: '여기는 제 개인 디지털 놀이터예요.\n\n주사선 효과, 경험치 바, 인벤토리 아카이브, 효과음까지 전부 16비트 콘솔 화면을 떠올리며 디자인했어요. 퀘스트 로그에서 글을 둘러보거나 **ARCADE_ZONE**에서 미니게임 랭킹에 도전해 보세요.'
  },
  {
    id: 'p2', slug: 'crisp-pixel-art', icon: '🎨', category_id: 'c-pixel', status: 'published', likes: 28,
    published_at: day(3), created_at: day(3), updated_at: day(3),
    title: '도트가 뭉개지지 않게: 선명한 픽셀 아트 렌더링',
    summary: 'CSS image-rendering 속성과 팔레트 선택으로 스프라이트를 또렷하게 보여주는 방법.',
    content: '브라우저는 이미지를 확대할 때 기본으로 부드럽게 보간해서, 작은 도트 이미지가 흐릿해져요.\n\n`image-rendering: pixelated`를 주면 픽셀 하나하나가 네모난 그대로 커져요.\n\n## 팁\n\n- PICO-8이나 NES처럼 팔레트를 16색, 32색으로 제한해 보세요.\n- 확대는 정수 배율(2배, 3배)로 하세요.'
  },
  {
    id: 'p3', slug: 'coffee-code-synthwave', icon: '☕', category_id: 'c-life', status: 'published', likes: 19,
    published_at: day(8), created_at: day(8), updated_at: day(8),
    title: '커피, 코드, 그리고 새벽의 신스웨이브',
    summary: '늦은 밤 코딩하면서 8비트 칩튠을 듣는 시간에 대한 짧은 기록.',
    content: '따뜻한 커피 한 잔과 8비트 칩튠을 틀어 놓고 새벽까지 코딩하는 시간에는 특별한 게 있어요.\n\n어릴 때 붙잡고 있던 게임기 화면이 떠오르고, 그때의 두근거림이 다시 돌아오는 것 같아요.'
  },
  {
    id: 'p4', slug: 'draft-shader-notes', icon: '🧪', category_id: 'c-tech', status: 'draft', likes: 0,
    published_at: null, created_at: day(0), updated_at: day(0),
    title: '픽셀 셰이더 공부 일지 1편 (초안)',
    summary: '아직 쓰는 중인 글이에요.',
    content: '초안입니다.'
  }
];

export const demoProfile: Profile = {
  name: 'PIXEL_DEVELOPER',
  bio: '레트로 게임을 좋아하는 웹 개발자입니다. 도트 감성과 요즘 웹 기술을 섞어서, 오래 머물고 싶은 작은 디지털 공간을 만듭니다.',
  class_label: 'TECH_WIZARD',
  alignment: 'CHAOTIC_GOOD',
  location: 'NEO-SEOUL 2088',
  skills: [
    { name: 'JavaScript / TypeScript', level: 95 },
    { name: 'React / Tailwind', level: 90 },
    { name: '픽셀 아트 · 게임 디자인', level: 82 },
    { name: '백엔드 · 데이터베이스', level: 88 }
  ],
  socials: [
    { label: 'GITHUB', handle: '@kissthecoke', url: 'https://github.com/kissthecoke', icon: 'fa-brands fa-github' },
    { label: 'TWITTER / X', handle: '@pixel_quest', url: 'https://x.com', icon: 'fa-brands fa-x-twitter' }
  ]
};

export const demoMessages: Message[] = [
  { id: 'm1', name: '플레이어 원', email: 'player1@example.com', body: '게임 랭킹 1등 찍었어요! 다음 게임도 기대할게요.', is_read: false, created_at: day(0) },
  { id: 'm2', name: '도트 장인', email: '', body: '픽셀 아트 글 잘 읽었어요. 팔레트 추천도 부탁드려요.', is_read: true, created_at: day(2) }
];

export const demoScores: Score[] = [
  { id: 1, nickname: 'NEON', score: 4820, coins: 21, created_at: day(0) },
  { id: 2, nickname: 'P1_JAY', score: 3910, coins: 17, created_at: day(1) },
  { id: 3, nickname: 'DOTDOT', score: 2750, coins: 12, created_at: day(2) },
  { id: 4, nickname: 'RUNNER', score: 1980, coins: 8, created_at: day(3) },
  { id: 5, nickname: 'COIN99', score: 1230, coins: 6, created_at: day(4) }
];
