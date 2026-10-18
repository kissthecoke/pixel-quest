import Inbox from '@/components/admin/Inbox';
import { PageHead } from '@/components/admin/ui';
import { adminGetMessages } from '@/lib/data';

export default async function MessagesAdmin() {
  const msgs = await adminGetMessages();
  return (
    <>
      <PageHead title="INBOX" ko={`TERMINAL에서 받은 편지 ${msgs.length}통 · 안 읽음 ${msgs.filter((m) => !m.is_read).length}통`} />
      <Inbox messages={msgs} />
    </>
  );
}
