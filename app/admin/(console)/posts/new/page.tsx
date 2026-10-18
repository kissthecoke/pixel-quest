import PostEditor from '@/components/admin/PostEditor';
import { adminGetCategories } from '@/lib/data';
export default async function NewPost() {
  return <PostEditor post={null} categories={await adminGetCategories()} />;
}
