import ArcadeGame from '@/components/ArcadeGame';
import { getTopScores } from '@/lib/data';

export const metadata = { title: 'ARCADE_ZONE' };
export const revalidate = 30;

export default async function ArcadePage() {
  return <ArcadeGame scores={await getTopScores(10)} />;
}
