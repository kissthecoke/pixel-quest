# PIXEL QUEST

레트로 아케이드 감성의 개인 홈페이지예요. 블로그, 미니게임 랭킹, 연락 편지함, 관리자 화면(GM_CONSOLE)이 있어요.

- **프론트엔드:** Next.js 15 (App Router) + Tailwind CSS
- **백엔드:** Supabase (데이터베이스, 관리자 로그인, 이미지 저장소)
- **호스팅:** Vercel

Supabase를 연결하기 전에는 **데모 모드**로 돌아가요. 예시 데이터로 화면을 볼 수 있고, 저장은 되지 않아요.

---

## 화면 구성

| 주소 | 내용 |
|---|---|
| `/` | QUEST_LOG: 글 목록, 카테고리 필터 (`/?cat=tech`) |
| `/posts/글주소` | 글 상세 (대화창 타자 효과, 좋아요) |
| `/inventory` | 글 아카이브 |
| `/about` | 프로필, 스킬, SNS 링크 |
| `/arcade` | 네온 시티 러너 미니게임 + 전체 랭킹 TOP 10 |
| `/contact` | 연락 폼 (편지함에 저장됨) |
| `/admin` | 관리자 화면: 현황, 글, 카테고리, 편지함, 게임 랭킹, 프로필 |

---

## 설치 순서

### 1. Supabase 프로젝트 만들기
1. https://supabase.com 에 가입하고 **New project**를 만들어요. 지역은 **Northeast Asia (Seoul)**을 추천해요.
2. 왼쪽 메뉴 **SQL Editor** → **New query**를 열어요.
3. `supabase/setup.sql`의 **맨 아래 `YOUR_EMAIL@example.com`을 내 이메일로 바꾸고**, 전체를 붙여넣은 뒤 **Run**을 눌러요.

### 2. 관리자 계정 만들기
1. **Authentication → Users → Add user → Create new user**
2. 1번에서 적은 이메일과 비밀번호를 넣고, **Auto Confirm User**를 켠 뒤 만들어요.
3. **Authentication → Sign In / Providers**에서 **Allow new users to sign up**을 꺼요. 다른 사람이 가입하지 못하게 막는 설정이에요.
   (가입을 꺼 두지 않아도, `app_admins`에 등록된 이메일만 관리자 기능을 쓸 수 있어요.)

### 3. 접속 정보 복사
**Project Settings → API**(또는 Data API)에서 두 가지를 복사해요.
- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- anon public 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. 내 컴퓨터에서 실행 (선택)
```bash
npm install
cp .env.example .env.local   # 복사한 값 두 개를 붙여넣기
npm run dev                  # http://localhost:3000
```

### 5. Vercel에 배포
1. https://vercel.com 에 GitHub 계정으로 로그인해요.
2. **Add New → Project**에서 이 저장소를 고르고 **Import**를 눌러요.
3. **Environment Variables**에 3번의 두 값을 넣고 **Deploy**를 눌러요.
4. 배포가 끝나면 `https://프로젝트이름.vercel.app/admin` 으로 들어가 로그인해요.

이후에는 GitHub에 코드를 올릴 때마다 자동으로 다시 배포돼요. 글, 카테고리, 프로필은 관리자 화면에서 고치면 바로 반영돼요 (최대 1분 캐시).

---

## 관리자 화면에서 할 수 있는 것
- **글:** 쓰기, 수정, 삭제, 미리보기, 초안 저장, 발행 예약, 이미지 올리기 (5MB 이하)
- **카테고리:** 추가, 이름, 주소, 색상, 아이콘, 순서 바꾸기, 삭제 (삭제하면 그 글은 미분류가 돼요)
- **편지함:** 읽음 표시, 삭제, 답장할 이메일 복사
- **게임 랭킹:** 부적절한 닉네임이나 이상한 기록 삭제
- **프로필:** 소개, 스킬 레벨, SNS 링크

### 글쓰기 문법
```
## 제목
### 소제목
- 목록
1. 번호 목록
> 인용
**굵게**  *기울임*  `코드`
[링크 글자](https://...)
![이미지 설명](이미지 주소)   ← 에디터의 '이미지' 버튼을 쓰면 자동으로 들어가요
```

---

## 보안 메모
- 모든 데이터는 Supabase의 RLS(행 단위 보안)로 보호돼요. 방문자는 발행된 글, 카테고리, 프로필만 읽을 수 있어요.
- 좋아요, 편지, 점수 등록은 검증 함수로만 들어가요. 같은 방문자의 좋아요 중복, 편지 도배(10분에 3통), 점수 조작(플레이 시간 대비 불가능한 점수)을 막아요.
- 방문자 구분은 브라우저 쿠키로 해요. 쿠키를 지우면 같은 사람이 다시 누를 수 있으니, 아주 엄격한 집계는 아니에요.
- `.env.local` 파일은 GitHub에 올라가지 않아요. anon 키는 공개되어도 괜찮은 키이고, 실제 권한은 RLS가 막아요.
