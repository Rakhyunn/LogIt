# LogIt — 프로젝트 기획안

---

## 프로젝트 개요

**LogIt**은 영화, 드라마, 책을 기록하고 리뷰를 공유하는 콘텐츠 로그 플랫폼입니다.

| 항목 | 내용 |
|------|------|
| 프로젝트명 | LogIt |
| 개발 기간 | 2026-05-12 ~ 2026-05-14 |
| 유형 | 풀스택 웹 애플리케이션 (Backend Bootcamp 프로젝트) |
| 배포 환경 | 로컬 개발 (원격 저장소 미연결) |

---

## 기획 배경

콘텐츠를 소비하는 사람들이 본 영화, 드라마, 읽은 책을 한 곳에 기록하고, 다른 사람들의 리뷰를 참고하며 취향이 맞는 사람을 팔로우할 수 있는 가벼운 SNS 형태의 플랫폼이 필요하다는 아이디어에서 시작했습니다.

**해결하려는 문제:**
- 본 콘텐츠를 흩어진 메모 대신 한 곳에서 관리
- 별점·태그 기반의 빠른 감상 기록
- 취향이 비슷한 유저 발견 및 팔로우

---

## 핵심 기능

### 인증 (Auth)
- 이메일/패스워드 회원가입 및 로그인
- Google OAuth 소셜 로그인
- 비밀번호 재설정 (이메일 링크)
- 최초 가입 시 username 설정 (프로필 Setup)
- 미설정 유저 자동 Setup 페이지 리다이렉트

### 콘텐츠 (Content)
- 영화 / 드라마 / 책 3가지 타입 등록
- 타입별 메타데이터 구조화 (감독, 개봉연도, 장르 / 에피소드 수 / 저자, 출판사)
- 커버 이미지 업로드 (Supabase Storage)
- 콘텐츠 수정 / 삭제 (등록자만)
- 타입별 필터 + 제목 검색

### 리뷰 (Review)
- 별점(1~5), Preset 태그 선택, 본문 작성
- 콘텐츠당 1인 1리뷰 (중복 방지)
- 리뷰 수정 / 삭제 (작성자만)
- 100자 이상 더보기/축약 토글
- 평균 별점 실시간 표시
- Suspense 스트리밍으로 콘텐츠 정보 먼저 렌더

### 북마크 (Bookmark)
- 콘텐츠 목록 카드 + 상세 페이지 양쪽에서 북마크 토글
- Optimistic UI — 클릭 즉시 상태 전환, 실패 시 롤백
- 내 프로필의 북마크 탭에서 목록 확인

### 유저/프로필 (User)
- 프로필 페이지: 아바타, username, bio, 팔로워/팔로잉 수, 리뷰·북마크 탭
- 프로필 수정: username 중복 확인, bio, 아바타 이미지
- 아바타 업로드: 파일 선택 즉시 업로드, 원형 미리보기 드래그로 focal point 조정

### 팔로우 (Follow)
- 프로필 페이지 + 콘텐츠 상세 작성자 영역에서 팔로우/언팔로우
- Optimistic UI 토글
- 자기 자신 팔로우 방지 (서버 + DB CHECK 이중 보호)

### 공통 UI/UX
- 글로벌 네비게이션 헤더 (로고, 콘텐츠 등록, 내 프로필, 로그아웃)
- 페이지별 로딩 스켈레톤 + 에러 페이지 (AlertCircle + 다시 시도 / 홈으로)
- 따뜻한 크림/브라운 팔레트, Playfair Display serif 헤딩

---

## 기술 스택

### Frontend
| 항목 | 버전/내용 |
|------|-----------|
| Framework | Next.js 16.2.6 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (base-ui 기반) |
| Icons | lucide-react |
| Fonts | Geist (본문), Playfair Display (헤딩) |
| State | React 19 `useOptimistic` + `useTransition` |

### Backend
| 항목 | 내용 |
|------|------|
| Database | Supabase Cloud (PostgreSQL) |
| Auth | Supabase Auth (이메일/패스워드, Google OAuth) |
| Storage | Supabase Storage (covers, avatars 버킷) |
| 보안 | Row Level Security (RLS) |
| API | Next.js Server Actions (별도 REST API 없음) |

---

## 도메인(아키텍처)

### 핵심 원칙

1. **서버 우선 렌더링** — 데이터 패칭은 Server Component. 인터랙션 최소 단위만 `'use client'`
2. **Supabase 단일 백엔드** — DB, Auth, Storage 모두 Supabase. 별도 API 서버 없음
3. **도메인 응집** — Auth / Content / Review / Bookmark / User / Follow 도메인으로 분리
4. **단방향 데이터 흐름** — Server Component(조회) → Client Component(표시) → Server Action(변경) → revalidate
5. **RLS 1차 보안** — 보안 규칙은 DB RLS에서 강제. 프론트 조건부 렌더링은 UX용

### 라우트 구조
```
app/
├── (auth)/          # 비로그인 전용 (login, signup, forgot-password, reset-password)
├── (main)/          # 로그인 + 프로필 설정 완료 필수
│   ├── page.tsx                          # 홈 (콘텐츠 목록)
│   ├── contents/
│   │   ├── new/page.tsx                  # 콘텐츠 등록
│   │   └── [id]/
│   │       ├── page.tsx                  # 콘텐츠 상세 + 리뷰
│   │       └── edit/page.tsx             # 콘텐츠 수정
│   └── profile/
│       ├── setup/page.tsx                # 최초 username 설정
│       └── [username]/
│           ├── page.tsx                  # 프로필 조회
│           └── edit/page.tsx             # 프로필 수정
└── auth/callback/route.ts                # OAuth 콜백
```

### 주요 Server Actions
| 파일 | 액션 |
|------|------|
| `actions/auth.ts` | signUpWithEmail, signInWithEmail, signInWithGoogle, signOut, setupProfile, updatePassword |
| `actions/contents.ts` | createContent, updateContent, deleteContent |
| `actions/reviews.ts` | createReview, updateReview, deleteReview |
| `actions/bookmarks.ts` | addBookmark, removeBookmark |
| `actions/user.ts` | checkUsername, updateProfile, followUser, unfollowUser |

---

## DB 설계

### 테이블 구조

#### `contents`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| type | enum | movie / drama / book |
| title | text | |
| description | text \| null | |
| cover_image_url | text \| null | Supabase Storage URL |
| metadata | jsonb | 타입별 구조화 데이터 |
| created_by | uuid | auth.users FK — 소유권 기준 |
| created_at | timestamptz | |

#### `profiles`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | auth.users.id와 동일 |
| username | text UNIQUE | 2~30자, 영문/숫자/밑줄 |
| avatar_url | text \| null | avatars 버킷 URL |
| avatar_position | jsonb | `{ x: number, y: number }` focal point |
| bio | text \| null | 자기소개 (최대 200자) |
| is_profile_setup | boolean | false = Setup 리다이렉트 대상 |
| created_at | timestamptz | |

#### `reviews`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| user_id | uuid FK | profiles.id |
| content_id | uuid FK | contents.id |
| rating | int | 1~5 |
| body | text \| null | 본문 |
| tags | text[] | preset 태그 배열 |
| created_at | timestamptz | |
| updated_at | timestamptz | 트리거 자동 갱신 |

> **제약:** `UNIQUE(user_id, content_id)` — 유저당 콘텐츠 1개 리뷰

#### `follows`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| follower_id | uuid FK | 팔로우 하는 유저 |
| following_id | uuid FK | 팔로우 받는 유저 |
| created_at | timestamptz | |

> **제약:** `CHECK(follower_id != following_id)` — 자기 팔로우 방지

#### `bookmarks`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| user_id | uuid FK | profiles.id |
| content_id | uuid FK | contents.id |
| created_at | timestamptz | |

> **제약:** `UNIQUE(user_id, content_id)`

### Storage 버킷
| 버킷 | 접근 | 경로 | 용도 |
|------|------|------|------|
| `covers` | public | `{user_id}/{timestamp}-{random}.{ext}` | 콘텐츠 커버 이미지 |
| `avatars` | public | `{user_id}/{timestamp}.{ext}` | 프로필 아바타 |

### ERD (텍스트)
```
auth.users
    │
    ├──[1:1]── profiles (id = auth.users.id)
    │               │
    │               ├──[1:N]── reviews ──[N:1]── contents
    │               ├──[1:N]── bookmarks ──[N:1]── contents
    │               ├──[1:N]── follows (follower_id)
    │               └──[N:1]── follows (following_id)
    │
    └──[1:N]── contents (created_by)
```

---

## 화면 구성 (페이지 목록)

| 경로 | 설명 | 접근 |
|------|------|------|
| `/login` | 로그인 | 비로그인 전용 |
| `/signup` | 회원가입 | 비로그인 전용 |
| `/forgot-password` | 비밀번호 재설정 요청 | 비로그인 전용 |
| `/reset-password` | 새 비밀번호 설정 | 이메일 링크 |
| `/` | 콘텐츠 목록 (홈) | 로그인 필수 |
| `/contents/new` | 콘텐츠 등록 | 로그인 필수 |
| `/contents/[id]` | 콘텐츠 상세 + 리뷰 | 로그인 필수 |
| `/contents/[id]/edit` | 콘텐츠 수정 | 소유자만 |
| `/profile/setup` | 최초 username 설정 | 미설정 유저 |
| `/profile/[username]` | 프로필 조회 | 로그인 필수 |
| `/profile/[username]/edit` | 프로필 수정 | 본인만 |

---

## 환경변수

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=
```
