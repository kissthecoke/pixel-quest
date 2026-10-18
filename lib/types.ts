export type Category = {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
  sort_order: number;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  icon: string;
  category_id: string | null;
  status: 'draft' | 'published';
  published_at: string | null;
  likes: number;
  created_at: string;
  updated_at: string;
  category?: Category | null;
};

export type Skill = { name: string; level: number };
export type Social = { label: string; handle: string; url: string; icon: string };

export type Profile = {
  name: string;
  bio: string;
  class_label: string;
  alignment: string;
  location: string;
  skills: Skill[];
  socials: Social[];
};

export type Message = {
  id: string;
  name: string;
  email: string;
  body: string;
  is_read: boolean;
  created_at: string;
};

export type Score = {
  id: number;
  nickname: string;
  score: number;
  coins: number;
  created_at: string;
};
