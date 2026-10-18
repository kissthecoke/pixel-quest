import 'server-only';
import { cookies } from 'next/headers';

/** 방문자 익명 ID. 없으면 만들어서 쿠키에 저장 (서버 액션 안에서만 호출) */
export async function getVisitorId(): Promise<string> {
  const store = await cookies();
  let id = store.get('pq_vid')?.value;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    id = crypto.randomUUID();
    store.set('pq_vid', id, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 365 * 2, secure: process.env.NODE_ENV === 'production' });
  }
  return id;
}
