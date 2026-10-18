import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const DEMO = !URL_ || !KEY;

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  // 관리자 화면: 로그인 세션 갱신 + 미로그인 시 로그인 화면으로
  if (!DEMO && req.nextUrl.pathname.startsWith('/admin')) {
    const sb = createServerClient(URL_, KEY, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        }
      }
    });
    const { data: { user } } = await sb.auth.getUser();
    const isLogin = req.nextUrl.pathname.startsWith('/admin/login');
    if (!user && !isLogin) {
      const to = req.nextUrl.clone();
      to.pathname = '/admin/login';
      to.search = '';
      return NextResponse.redirect(to);
    }
  }

  // 방문자 구분용 익명 ID (좋아요 중복 방지, 연락/점수 도배 방지)
  if (!req.cookies.get('pq_vid')) {
    res.cookies.set('pq_vid', crypto.randomUUID(), {
      httpOnly: true, sameSite: 'lax', secure: req.nextUrl.protocol === 'https:', path: '/', maxAge: 60 * 60 * 24 * 365 * 2
    });
  }
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)']
};
