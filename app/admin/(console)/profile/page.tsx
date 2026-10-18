import ProfileForm from '@/components/admin/ProfileForm';
import { PageHead } from '@/components/admin/ui';
import { getProfile } from '@/lib/data';

export default async function ProfileAdmin() {
  return (
    <>
      <PageHead title="PROFILE" ko="STATS(ABOUT) 화면에 보이는 소개, 스킬, 링크를 고쳐요" />
      <ProfileForm profile={await getProfile()} />
    </>
  );
}
