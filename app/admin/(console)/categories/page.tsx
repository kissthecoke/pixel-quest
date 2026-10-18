import CategoryManager from '@/components/admin/CategoryManager';
import { PageHead } from '@/components/admin/ui';
import { adminGetCategories, adminGetPosts } from '@/lib/data';

export default async function CategoriesAdmin() {
  const [cats, posts] = await Promise.all([adminGetCategories(), adminGetPosts()]);
  const counts: Record<string, number> = {};
  posts.forEach((p) => { if (p.category_id) counts[p.category_id] = (counts[p.category_id] ?? 0) + 1; });
  return (
    <>
      <PageHead title="CATEGORIES" ko="카테고리를 만들고 색상, 아이콘, 순서를 정해요. 왼쪽 CATEGORY_KEYS에 바로 반영돼요." />
      <CategoryManager categories={cats} counts={counts} />
    </>
  );
}
