import ScoreTable from '@/components/admin/ScoreTable';
import { PageHead } from '@/components/admin/ui';
import { adminGetScores } from '@/lib/data';

export default async function ScoresAdmin() {
  return (
    <>
      <PageHead title="RANKING" ko="게임 랭킹 기록이에요. 부적절한 닉네임이나 이상한 기록은 지울 수 있어요. 위 10개가 방문자에게 보여요." />
      <ScoreTable scores={await adminGetScores()} />
    </>
  );
}
