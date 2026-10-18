import { notFound } from 'next/navigation';
import PostEditor from '@/components/admin/PostEditor';
import { adminGetCategories, adminGetPost } from '@/lib/data';
export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, cats] = await Promise.all([adminGetPost(id), adminGetCategories()]);
  if (!post) notFound();
  return <PostEditor key={post.id} post={post} categories={cats} />;
}
