# LogIt

> 영화, 드라마, 책을 기록하고 리뷰를 공유하는 콘텐츠 로그 플랫폼

**배포 주소:** https://log-it-henna.vercel.app

---

## 1. 프로젝트명

**LogIt** — 내가 본 것, 읽은 것을 기록하는 콘텐츠 로그 플랫폼

영화, 드라마, 책을 한 곳에 기록하고 별점·태그로 감상을 남기며, 취향이 비슷한 유저를 팔로우해 새로운 콘텐츠를 발견하는 SNS형 서비스입니다.

|               |                                                                        |
| ------------- | ---------------------------------------------------------------------- |
| **개발 기간** | 2026-05-12 ~ 2026-05-15                                                |
| **개발 방식** | AI 에이전트(Claude Code) 활용 바이브 코딩 — 기획·설계 방향은 직접 결정 |
| **배포 환경** | Vercel (Seoul 리전) + Supabase Cloud                                   |

---

## 2. 프로젝트 개요

### 프로젝트 목적

콘텐츠를 소비하는 사람들이 본 영화·드라마·읽은 책을 **한 곳에서 관리**하고, 다른 사람의 리뷰를 참고하며 취향이 맞는 사람을 팔로우할 수 있는 가벼운 SNS 형태의 플랫폼을 만드는 것이 목표입니다.

### 어떤 문제를 해결하는가

| 문제                                  | 해결 방식                                  |
| ------------------------------------- | ------------------------------------------ |
| 본 콘텐츠를 흩어진 메모·메신저에 남김 | 타입별(영화/드라마/책) 구조화된 기록       |
| 감상을 길게 작성하기 번거로움         | 별점 + 프리셋 태그로 빠른 감상 저장        |
| 취향이 비슷한 사람을 찾기 어려움      | 팔로우·리뷰 공유로 취향 기반 네트워크 형성 |
| 나중에 볼 콘텐츠 목록 관리            | 북마크 기능으로 관심 콘텐츠 저장           |

### 주요 기능 요약

- **콘텐츠 관리** — 영화/드라마/책 등록, 커버 이미지 업로드, 검색·필터
- **리뷰 시스템** — 별점 + 프리셋 태그 + 자유 본문, 1인 1리뷰 제한
- **북마크** — Optimistic UI, 목록·상세 양쪽에서 즉시 저장
- **팔로우** — 프로필·콘텐츠 상세 양쪽에서 팔로우, 자기 팔로우 방지
- **인증** — 이메일/패스워드 + Google OAuth, 비밀번호 재설정

### 프로젝트 진행 배경

Backend Bootcamp 과정에서 Next.js App Router와 Supabase를 실전 적용하는 프로젝트입니다. AI 에이전트(Claude Code)를 개발 도구로 활용하는 바이브 코딩 방식을 경험하고, 기획·설계 결정은 직접 내리며 AI에게 구현을 위임하는 협업 프로세스를 실험하는 것이 주요 목표였습니다.

---

## 3. 기술 스택

### Frontend

| 기술                         | 선택 이유                                                                                           |
| ---------------------------- | --------------------------------------------------------------------------------------------------- |
| **Next.js App Router**       | Server Component 우선 렌더링으로 데이터 패칭 최적화. Streaming·Suspense로 콘텐츠와 리뷰를 분리 로딩 |
| **TypeScript**               | Supabase 생성 타입과 연동해 DB 스키마 변경이 컴파일 오류로 즉시 감지                                |
| **Tailwind CSS v4**          | CSS 변수 기반 디자인 토큰으로 컬러 팔레트 일괄 관리                                                 |
| **shadcn/ui (base-ui)**      | 접근성이 내장된 헤드리스 컴포넌트. 디자인 커스텀 자유도 높음                                        |
| **React 19 `useOptimistic`** | 라이브러리 없이 북마크·팔로우 즉각 반응 구현                                                        |
| **lucide-react**             | 일관된 아이콘 세트                                                                                  |

### Backend

| 기술                       | 선택 이유                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| **Supabase Cloud**         | DB · Auth · Storage · RLS를 단일 서비스로 제공. 별도 API 서버 불필요                        |
| **Next.js Server Actions** | 클라이언트-서버 경계를 명시적으로 관리. REST API 엔드포인트 없이 타입 안전한 서버 함수 호출 |
| **Row Level Security**     | DB 수준에서 보안 강제. 프론트 우회 시도를 원천 차단                                         |

### AI 에이전트

| 도구            | 활용 방식                                                                                                                        |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Claude Code** | 설계 방향과 요구사항을 프롬프트로 전달해 코드 구현 위임. 도메인 문서 작성, 컴포넌트 생성, 버그 수정, 트러블슈팅 전 과정에서 활용 |

---

## 4. 주요 기능

### 📼 콘텐츠 관리

- 영화 / 드라마 / 책 3가지 타입 등록 및 관리
- 타입별 메타데이터 구조화 (감독·개봉연도·장르 / 에피소드 수 / 저자·출판사)
- 커버 이미지 직접 업로드 (Supabase Storage `covers` 버킷)
- 제목 검색 + 타입별 필터 (URL 쿼리 파라미터 기반)
- 등록자 본인만 수정·삭제 가능 (RLS + UI 이중 보호)

### ⭐ 리뷰 시스템

- 별점(1~5점) + 프리셋 태그(10종) + 자유 본문
- 콘텐츠당 1인 1리뷰 제한 (`UNIQUE(user_id, content_id)` DB 제약)
- 평균 별점 실시간 표시 (리뷰 목록에서 JS로 계산)
- 100자 이상 리뷰는 더보기/축약 토글
- Suspense 스트리밍 — 콘텐츠 정보 먼저 렌더, 리뷰 목록은 별도 로딩

### 🔖 북마크

- 콘텐츠 목록 카드와 상세 페이지 양쪽에서 즉시 저장
- **Optimistic UI** — 클릭 즉시 상태 전환, 서버 실패 시 자동 롤백
- 내 프로필 북마크 탭에서 저장 목록 확인
- 타인 프로필에서는 북마크 탭 숨김 (RLS 정책상 본인만 조회 가능)

### 👤 프로필

- username · bio · 아바타 이미지 설정
- 아바타 업로드 후 드래그로 focal point 조정 (라이브러리 없이 마우스 이벤트로 구현)
- `object-position: x% y%` CSS 값을 DB에 저장해 렌더링 비용 최소화
- 팔로워 / 팔로잉 수 표시

### 🤝 팔로우

- 프로필 페이지 + **콘텐츠 상세 작성자 영역**에서 팔로우/언팔로우
- **Optimistic UI** 토글
- 자기 자신 팔로우 방지 — Server Action 검증 + DB `CHECK(follower_id != following_id)` 이중 보호

### 🔐 인증

- 이메일/패스워드 회원가입 · 로그인
- Google OAuth 소셜 로그인
- 비밀번호 재설정 (이메일 링크 → `/auth/callback?next=/reset-password`)
- 최초 가입 시 username 설정 페이지로 자동 리다이렉트 (`is_profile_setup` 컬럼 기반)
- 로그인 상태 기반 라우트 보호 (Next.js Middleware)

---

## 5. 프로젝트 구조

```
agent_project/
├── frontend/                        # Next.js 앱
│   ├── app/
│   │   ├── (auth)/                  # 비로그인 전용 라우트
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── (main)/                  # 로그인 + 프로필 설정 완료 필수
│   │   │   ├── _components/         # 공유 컴포넌트
│   │   │   │   ├── header.tsx
│   │   │   │   ├── avatar.tsx
│   │   │   │   ├── bookmark-button.tsx
│   │   │   │   └── follow-button.tsx
│   │   │   ├── contents/
│   │   │   │   ├── new/             # 콘텐츠 등록
│   │   │   │   └── [id]/            # 콘텐츠 상세 + 수정
│   │   │   └── profile/
│   │   │       ├── setup/           # 최초 username 설정
│   │   │       └── [username]/      # 프로필 조회 + 수정
│   │   └── auth/callback/           # OAuth 콜백 Route Handler
│   ├── actions/                     # Server Actions
│   │   ├── auth.ts                  # signUp, signIn, signOut, OAuth, resetPassword
│   │   ├── contents.ts              # createContent, updateContent, deleteContent
│   │   ├── reviews.ts               # createReview, updateReview, deleteReview
│   │   ├── bookmarks.ts             # addBookmark, removeBookmark
│   │   └── user.ts                  # checkUsername, updateProfile, follow/unfollow
│   ├── components/ui/               # shadcn/ui 컴포넌트
│   ├── lib/supabase/
│   │   ├── client.ts                # createBrowserClient (Client Component)
│   │   ├── server.ts                # createServerClient async (Server Component/Action)
│   │   └── middleware.ts            # updateSession
│   └── types/
│       ├── database.ts              # Supabase DB 타입 (Row/Insert/Update)
│       └── content.ts               # 콘텐츠 metadata 타입
├── backend/
│   └── supabase/
│       └── migrations/              # DB 마이그레이션 SQL
│           └── 20260512000000_initial_schema.sql
└── docs/                            # 프로젝트 문서
    ├── PROJECT-OVERVIEW.md          # 기획안 + DB 설계 + 설계 결정 기록
    ├── ARCHITECTURE-CONSTITUTION.md # 아키텍처 핵심 원칙
    ├── DOMAIN-*.md                  # 도메인별 원칙·구현 규칙
    └── AI-ACTION-LOGS.md            # 전체 구현 이력
```

### 아키텍처 개요

```
┌─────────────────────────────────────────┐
│              Next.js App Router          │
│                                          │
│  Server Component ──fetch──▶ Supabase DB │
│        │                                 │
│        ▼                                 │
│  Client Component                        │
│        │                                 │
│        ▼ (mutation)                      │
│  Server Action ──write──▶ Supabase DB    │
│        │                                 │
│        └──── revalidatePath ────────────▶│
└─────────────────────────────────────────┘
```

**단방향 데이터 흐름**

1. Server Component가 Supabase에서 데이터 조회
2. Client Component에서 사용자 인터랙션 처리
3. Server Action으로 DB 변경 (RLS가 소유권 강제)
4. `revalidatePath`로 캐시 무효화 → Server Component 재실행

---

## 6. 실행 방법

### 사전 요구사항

- Node.js 18+
- Supabase CLI
- Supabase Cloud 프로젝트 (무료 플랜 가능)

### 설치

```bash
# 저장소 클론
git clone <repo-url>
cd agent_project/frontend

# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
```

`.env.local`에 다음 값 입력:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### DB 마이그레이션

```bash
cd ../backend
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

### 개발 서버 실행

```bash
cd ../frontend
npm run dev
# http://localhost:3000
```

### 빌드 및 배포

```bash
npm run build   # 프로덕션 빌드
npm run start   # 프로덕션 서버 실행
```

Vercel 배포 시 `vercel.json`에서 리전을 Seoul(`icn1`)로 고정합니다 (Supabase Seoul 리전과의 레이턴시 최소화).

---

## 7. Supabase 설정

### Authentication

| 항목                 | 설정                                                                                               |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| **이메일/패스워드**  | 사용 (이메일 확인 필요)                                                                            |
| **Google OAuth**     | 사용 (Supabase 대시보드에서 Google Cloud OAuth 2.0 클라이언트 연동)                                |
| **비밀번호 재설정**  | 이메일 링크 방식, 콜백 URL → `/auth/callback?next=/reset-password`                                 |
| **자동 프로필 생성** | `handle_new_user` 트리거 — 회원가입 시 `profiles` 행 자동 삽입 (username: email prefix + UUID 6자) |

### 테이블 구조

#### `contents` — 콘텐츠 (영화/드라마/책)

| 컬럼            | 타입         | 설명                                                              |
| --------------- | ------------ | ----------------------------------------------------------------- |
| id              | uuid PK      |                                                                   |
| type            | enum         | `movie` / `drama` / `book`                                        |
| title           | text         |                                                                   |
| description     | text \| null |                                                                   |
| cover_image_url | text \| null | Supabase Storage URL                                              |
| metadata        | jsonb        | 타입별 구조화 데이터 (감독·연도·장르 / 에피소드 수 / 저자·출판사) |
| created_by      | uuid FK      | `auth.users.id` — 소유권 기준                                     |
| created_at      | timestamptz  |                                                                   |

#### `profiles` — 유저 프로필

| 컬럼             | 타입         | 설명                                       |
| ---------------- | ------------ | ------------------------------------------ |
| id               | uuid PK      | `auth.users.id`와 동일                     |
| username         | text UNIQUE  | 2~30자, 영문·숫자·밑줄                     |
| avatar_url       | text \| null | `avatars` 버킷 URL                         |
| avatar_position  | jsonb        | `{ x: number, y: number }` focal point (%) |
| bio              | text \| null | 자기소개 (최대 200자)                      |
| is_profile_setup | boolean      | `false`이면 `/profile/setup` 리다이렉트    |
| created_at       | timestamptz  |                                            |

#### `reviews` — 리뷰

| 컬럼       | 타입         | 설명             |
| ---------- | ------------ | ---------------- |
| id         | uuid PK      |                  |
| user_id    | uuid FK      | `profiles.id`    |
| content_id | uuid FK      | `contents.id`    |
| rating     | int          | 1~5              |
| body       | text \| null | 본문             |
| tags       | text[]       | 프리셋 태그 배열 |
| created_at | timestamptz  |                  |
| updated_at | timestamptz  | 트리거 자동 갱신 |

> 제약: `UNIQUE(user_id, content_id)` — 유저당 콘텐츠 1개 리뷰

#### `follows` — 팔로우 관계

| 컬럼         | 타입        | 설명             |
| ------------ | ----------- | ---------------- |
| follower_id  | uuid FK     | 팔로우 하는 유저 |
| following_id | uuid FK     | 팔로우 받는 유저 |
| created_at   | timestamptz |                  |

> 제약: `CHECK(follower_id != following_id)` — 자기 팔로우 방지

#### `bookmarks` — 북마크

| 컬럼       | 타입        | 설명          |
| ---------- | ----------- | ------------- |
| user_id    | uuid FK     | `profiles.id` |
| content_id | uuid FK     | `contents.id` |
| created_at | timestamptz |               |

> 제약: `UNIQUE(user_id, content_id)`

### 주요 RLS 정책

| 테이블      | 정책                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------- |
| `contents`  | SELECT: 전체 공개 / INSERT·UPDATE·DELETE: `created_by = auth.uid()`                         |
| `profiles`  | SELECT: 전체 공개 / INSERT: `id = auth.uid()` / UPDATE: `id = auth.uid()`                   |
| `reviews`   | SELECT: 전체 공개 / INSERT·UPDATE·DELETE: `user_id = auth.uid()`                            |
| `follows`   | SELECT: 전체 공개 / INSERT: `follower_id = auth.uid()` / DELETE: `follower_id = auth.uid()` |
| `bookmarks` | SELECT: `user_id = auth.uid()` / INSERT·DELETE: `user_id = auth.uid()`                      |

> 전 테이블 RLS 활성화. 프론트 조건부 렌더링은 UX 목적이며 보안은 RLS에서 강제합니다.

### Storage 버킷

| 버킷      | 접근        | 경로 패턴                              | 용도               |
| --------- | ----------- | -------------------------------------- | ------------------ |
| `covers`  | public read | `{user_id}/{timestamp}-{random}.{ext}` | 콘텐츠 커버 이미지 |
| `avatars` | public read | `{user_id}/{timestamp}.{ext}`          | 프로필 아바타      |

두 버킷 모두 **읽기는 공개**, **쓰기·삭제는 본인(`auth.uid() = user_id 경로`)만** 가능합니다.

---

## 8. AI 에이전트 활용 방식

이 프로젝트는 **Claude Code**를 AI 에이전트로 활용한 바이브 코딩 방식으로 개발되었습니다.

### 역할 분담

| 사람 (기획자·설계자)                       | Claude Code (구현자)                         |
| ------------------------------------------ | -------------------------------------------- |
| 도메인 정의 및 기능 범위 결정              | 도메인별 문서(Constitution·Statute) 작성     |
| 기술 스택 선택                             | 환경 설정, 패키지 설치, 파일 스캐폴딩        |
| 설계 결정 (타입 한정, 버튼 배치, UI 톤 등) | 설계 결정을 바탕으로 컴포넌트·서버 액션 구현 |
| 코드 리뷰 및 방향 피드백                   | 피드백 반영, 버그 수정, 리팩터링             |
| 트러블슈팅 현상 보고                       | 원인 분석 및 수정 코드 제안·적용             |

### 구체적 활용 사례

- **도메인 문서 주도 개발**: 구현 전 `DOMAIN-*.md` 문서(원칙·규칙)를 먼저 작성하게 해 방향 정렬 후 코드 생성
- **단계별 구현**: 기획 → 스펙 → 플랜 → 구현 → 검증의 단계를 프롬프트로 지시해 체계적으로 진행
- **Optimistic UI 패턴**: `useOptimistic` + `useTransition` 조합을 표준 패턴으로 정의하고 북마크·팔로우에 일관 적용
- **트러블슈팅**: 배포 환경에서 발생한 레이턴시 문제를 현상 설명만으로 원인 분석부터 수정까지 진행
- **AI-ACTION-LOGS**: 세션마다 작업 이력을 로그로 남겨 맥락을 이어가는 방식으로 긴 개발 과정 관리

---

## 9. 트러블슈팅

### 문제 - Vercel 배포 환경에서 응답 속도 저하

---

#### 1️⃣ 문제 상황

- 로컬 실행 환경에서는 괜찮았는데 Vercel을 이용하여 배포를 하고 페이지 이동이나 북마크 등 Supabase와 응답하는 시간이 2-3초 가량 걸리는 문제가 생겼다.

---

#### 2️⃣ 문제 정의

> **Supabase와 클라이언트 소통 간의 응답 시간 문제**

---

#### 3️⃣ 해결 과정

1. **DB 쿼리 체크**

   처음에는 DB 쿼리가 문제가 있는 거 같아 Claude Code를 활용하여 DB 쿼리 부분을 체크하여 다음의 분석을 얻음

   | 번호 | 개선                       | 효과               |
   | ---- | -------------------------- | ------------------ |
   | 1    | ReviewSection JOIN         | 왕복 1회 감소      |
   | 2    | 홈페이지 select 최적화     | 데이터 전송량 감소 |
   | 3    | revalidatePath 범위 최소화 | 재빌드 범위 축소   |
   | 4    | getUser → getSession       | 인증 왕복 제거     |

   이에 맞춰 쿼리를 개선을 진행하였지만 응답이 눈에 띄게 변하지 않아 다른 문제라고 깨달았다.

2. **Vercel 함수 지역**

   다른 근본적인 부분을 체크하여 Vercel 함수 지역을 Supabase의 프로젝트에 설정한 지역과 일치해야 한다는 점을 파악했다.

   따라서 `frontend/vercel.json` 을 따로 생성하였다.

   ```json
   {
     "regions": ["icn1"]
   }
   ```

   이렇게 지역을 맞추어 리빌드 후 테스트를 해보았는데 모든 동작인 0.3~0.5초 가량으로 눈에 띄게 개선이 되었다.

---

#### 4️⃣ 결과

#### **Before**

- 실제 처리 시간(네트워크)

<img width="386" height="319" alt="image" src="https://github.com/user-attachments/assets/22dace2c-d529-4c50-ad6e-90aaddeeb85d" />


#### **After**

- 실제 처리 시간(네트워크)
<img width="379" height="181" alt="image" src="https://github.com/user-attachments/assets/096c6bb6-9697-4f36-b852-b6fe89918186" />



#### **수치**

- 2-3초 가량 걸리던 시간을 0.3-0.5초로 개선

---

#### 5️⃣ 배운 점

1. **로컬과 배포 환경은 다르다**
   로컬에서는 DB와 서버가 같은 네트워크에 있어 레이턴시가 거의 없지만, 배포 환경에서는 Vercel 함수와 Supabase DB가 물리적으로 다른 지역에 있으면 모든 쿼리마다 네트워크 왕복 비용이 발생한다.
2. **인프라 설정이 코드 최적화보다 먼저다**
   DB 쿼리를 아무리 최적화해도 서버 지역이 잘못 설정되어 있으면
   효과가 없다. 성능 문제는 코드보다 인프라 구성을 먼저 확인해야 한다.
3. **vercel.json으로 함수 실행 지역을 명시적으로 지정해야 한다**
   Vercel 기본 배포 지역(미국)과 Supabase 프로젝트 지역을 맞추지 않으면 한국 서비스에서 불필요한 레이턴시가 생긴다. icn1(서울) 리전 설정으로 2~3초 → 0.3~0.5초로 개선됐다.

---

## 10. 회고

### 어려웠던 점

- **AI와의 맥락 공유**: 긴 개발 세션에서 AI가 이전 결정을 기억하지 못해 방향이 흔들리는 경우가 있었습니다. AI-ACTION-LOGS와 도메인 문서를 세션마다 컨텍스트로 제공하는 방식으로 해결했지만, 초반에는 이 패턴을 찾기까지 시행착오가 있었습니다.
- **설계와 구현의 경계**: AI가 구현을 담당하다 보니 처음엔 설계 결정을 충분히 고민하지 않고 "일단 만들어보자"는 식으로 접근하려는 유혹이 있었습니다. 문서 선행 작성 원칙을 세운 후로 방향이 명확해졌습니다.
- **배포 환경 디버깅**: 로컬에서 발생하지 않는 레이턴시 문제는 재현이 어려워 원인 파악에 시간이 걸렸습니다.

### 개선하고 싶은 점

- **팔로워/팔로잉 목록 페이지**: 현재는 숫자만 표시되고 목록 페이지가 없습니다. `profile/[username]/followers` 라우트를 추가해 완성도를 높이고 싶습니다.
- **콘텐츠 타입 확장**: MVP에서는 영화·드라마·책으로 한정했지만, `metadata jsonb` 구조 덕분에 DB 마이그레이션 없이 음악·게임 등 새로운 타입을 추가할 수 있습니다.
- **무한 스크롤**: 현재 콘텐츠 목록은 페이지네이션 없이 전체 조회입니다. 콘텐츠가 많아질수록 성능에 영향을 줄 수 있어 커서 기반 페이지네이션이 필요합니다.
- **실시간 채팅**: 메시지나 인스타그램의 DM 기능처럼 실시간 채팅으로 서로의 취향을 공유할 수 있도록 하는 기능을 구현하고 싶습니다.

### 새롭게 배운 점

- **Next.js App Router의 Streaming**: Suspense와 `loading.tsx`를 조합해 콘텐츠 정보와 리뷰를 분리 로딩하면 체감 성능이 크게 향상됩니다.
- **RLS 정책 설계**: 프론트 조건부 렌더링과 DB 수준 보안을 명확히 분리해야 한다는 것을 배웠습니다. RLS가 없다면 API 우회나 서버 액션 직접 호출로 권한 우회가 가능합니다.
- **Optimistic UI 패턴**: `useOptimistic` + `useTransition` 조합이 라이브러리 없이도 충분히 강력하다는 것을 확인했습니다. 실패 시 롤백 로직까지 포함해야 프로덕션 수준이 됩니다.
- **Vercel + Supabase 리전 정렬**: 두 서비스의 리전이 다르면 서버리스 함수마다 레이턴시가 누적됩니다. 배포 초기에 리전을 맞추는 것이 중요합니다.

### AI 에이전트를 사용하면서 느낀 점

AI 에이전트(Claude Code)를 활용한 바이브 코딩은 **구현 속도를 크게 높여주지만, 설계 능력은 오히려 더 중요해진다**는 것을 느꼈습니다.

AI를 활용하여 구현하면 한 번에 너무 많은 업무를 부여하지 않고 정확하게 작은 업무 단위로 수행하도록 진행하면 자동화가 잘 되며 구현이 꽤나 잘된다고 생각합니다. DB나 도메인이 너무 복잡하지 않으면 AI를 사용하는 것이 당연하게 생각됩니다.

하지만 그럼에도 불구하고 AI가 구현하는 것은 모두 옳은 것은 아니기에 테이블 설계나 구현이 맞는지 검증할 수 있는 기본기가 탄탄해야 한다고 판단됩니다. AI를 활용하기 위해 더더욱 **CS 지식이나 도메인 관련 지식, 기본 코딩 실력**을 더 키워야겠다고 생각했습니다.

---

## 11. 참고 자료

### 공식 문서

| 문서                                                                                  | 내용                                                      |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| [Next.js App Router](https://nextjs.org/docs/app)                                     | App Router, Server Components, Server Actions, Middleware |
| [Supabase Docs](https://supabase.com/docs)                                            | Auth, Database, Storage, RLS, JavaScript Client           |
| [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) | Row Level Security 정책 작성 가이드                       |
| [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/nextjs)              | Next.js App Router에서 Supabase 세션 관리                 |
| [Tailwind CSS v4](https://tailwindcss.com/docs/v4-beta)                               | CSS 변수 기반 디자인 토큰, 새 설정 방식                   |
| [shadcn/ui](https://ui.shadcn.com)                                                    | 컴포넌트 설치 및 커스터마이징                             |
| [React 19 useOptimistic](https://react.dev/reference/react/useOptimistic)             | Optimistic UI 패턴                                        |
| [Vercel Regions](https://vercel.com/docs/edge-network/regions)                        | Vercel 함수 리전 설정 (`vercel.json`)                     |

### 라이브러리

| 라이브러리                                                       | 용도                           |
| ---------------------------------------------------------------- | ------------------------------ |
| [@supabase/supabase-js](https://github.com/supabase/supabase-js) | Supabase JavaScript 클라이언트 |
| [@supabase/ssr](https://github.com/supabase/ssr)                 | Next.js App Router SSR 지원    |
| [lucide-react](https://lucide.dev)                               | 아이콘                         |
| [shadcn/ui](https://ui.shadcn.com)                               | 헤드리스 UI 컴포넌트           |

### 참고 사이트

| 사이트                                            | 참고 내용                    |
| ------------------------------------------------- | ---------------------------- |
| [Letterboxd](https://letterboxd.com)              | 콘텐츠 기록·리뷰 UX 레퍼런스 |
| [Readwise](https://readwise.io)                   | 독서 기록 서비스 UI 톤 참고  |
| [Vercel Deployment Docs](https://vercel.com/docs) | Vercel 배포 환경 설정        |
