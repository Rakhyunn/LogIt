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

---

## 설계 결정 기록 (Design Decision Log)

> 이 프로젝트는 AI 코딩 도구를 활용한 바이브 코딩 방식으로 구현됐습니다.
> 구현 자체는 AI가 담당했고, 아래 결정들은 기획자이자 설계 방향을 결정한 사람으로서 직접 선택한 내용입니다.

---

### 1. 콘텐츠 타입을 영화 / 드라마 / 책으로 한정

**배경:**
처음에는 음악, 게임, 전시 등 더 많은 타입을 고려했습니다.

**결정 이유:**
콘텐츠 타입이 늘어날수록 타입별 메타데이터 구조(감독, 에피소드 수, 저자 등)를 각각 정의해야 하고, 필터 UI도 복잡해집니다. MVP에서는 구조가 명확하고 함께 소비되는 경우가 많은 3가지로 한정해 완성도를 높이는 편이 낫다고 판단했습니다.

**트레이드오프:**
확장성보다 현재의 완결성을 선택했습니다. `metadata jsonb` 컬럼 구조 덕분에 나중에 타입을 추가해도 DB 마이그레이션 없이 메타데이터 타입 정의만 추가하면 됩니다.

---

### 2. 팔로워/팔로잉 목록 페이지 MVP 제외

**배경:**
팔로우 기능을 설계할 때 팔로워/팔로잉 목록 페이지(`/profile/[username]/followers`)도 포함할지 논의했습니다.

**결정 이유:**
팔로워 수 표시와 팔로우 토글만으로도 핵심 소셜 기능은 동작합니다. 목록 페이지는 UX 완성도를 높이지만 지금 단계에서는 오버엔지니어링입니다. 프로필 페이지에서 팔로워 수를 클릭하면 목록을 보여주는 기능은 향후 추가할 수 있도록 백로그에 남겼습니다.

---

### 3. 북마크 버튼을 목록 카드와 상세 페이지 양쪽에 배치

**배경:**
초기에는 콘텐츠 상세 페이지에만 북마크 버튼을 두는 방안을 고려했습니다.

**결정 이유:**
목록에서 콘텐츠를 훑어볼 때 관심 있는 항목을 상세 페이지로 들어가지 않고도 바로 저장할 수 있어야 한다고 판단했습니다. 넷플릭스나 왓챠 같은 서비스에서 리스트 카드에서 바로 저장하는 UX가 사용성이 높다는 점을 참고했습니다.

**구현 방향:**
목록 카드에 북마크 슬롯을 render prop으로 주입하는 방식을 선택했습니다. ContentCard가 북마크 도메인 로직을 직접 알지 않아도 되도록 분리함으로써 컴포넌트 재사용성과 도메인 경계를 지켰습니다.

---

### 4. 팔로우 버튼을 콘텐츠 상세 페이지 작성자 영역에도 배치

**배경:**
팔로우 버튼은 프로필 페이지에만 있는 게 일반적입니다.

**결정 이유:**
콘텐츠를 보다가 "이 사람 리뷰 더 보고 싶다"는 흐름이 자연스럽습니다. 프로필 페이지로 이동해야만 팔로우할 수 있으면 마찰이 생기기 때문에, 콘텐츠 상세에서도 작성자 이름 옆에 팔로우 버튼을 두었습니다. Instagram, Letterboxd 등에서 게시물 하단에 팔로우 버튼이 있는 패턴을 참고했습니다.

---

### 5. 아바타 위치 조정 — 드래그 focal point 방식

**배경:**
아바타 업로드는 이미지를 그냥 올리는 것과, 원형 크롭 영역 안에서 어느 부분을 보여줄지 조정할 수 있는 것으로 나뉩니다.

**결정 이유:**
프로필 사진은 얼굴이 잘리면 어색합니다. 사용자가 직접 원형 안에서 드래그해 포커스 위치를 맞출 수 있어야 한다고 판단했습니다. Twitter, GitHub의 아바타 편집 방식을 참고했습니다.

**구현 방향:**
별도 라이브러리 없이 순수 마우스 이벤트로 구현했습니다. `object-position: x% y%` CSS 값을 DB에 저장하는 방식이라 렌더링 비용이 거의 없습니다.

---

### 6. 타인 프로필에서 북마크 탭 숨김

**배경:**
프로필 탭에 리뷰와 북마크 두 탭이 있었는데, 타인의 프로필에서 북마크 탭을 보여줄지 말지 결정이 필요했습니다.

**결정 이유:**
RLS 정책상 북마크는 본인만 조회 가능해서 타인 프로필에서 북마크 탭을 열면 항상 빈 화면이 나옵니다. 빈 탭을 보여주는 것보다 탭 자체를 숨기는 것이 더 자연스럽습니다. 북마크는 개인적인 저장 목록이므로 공개하지 않는 것이 UX적으로도 맞다고 판단했습니다.

---

### 7. UI/UX 톤 — 따뜻한 크림/브라운 팔레트

**배경:**
초기 UI는 기본 shadcn 흑백 팔레트였습니다. 기능 구현이 완료된 후 전체적인 분위기를 잡는 단계에서 방향을 결정했습니다.

**결정 이유:**
LogIt은 감성적인 콘텐츠(영화, 책)를 기록하는 서비스입니다. 딱딱한 SaaS 느낌보다 Readwise, Notion 라이트모드처럼 독서/기록에 친숙한 따뜻한 톤이 서비스 성격과 맞다고 판단했습니다. Playfair Display serif 헤딩은 책/잡지의 감성을 더합니다.

**구현 방향:**
CSS 변수(토큰) 레이어를 먼저 변경해 shadcn 컴포넌트 전체에 자동 적용하고, 이후 컴포넌트별로 세부 스타일을 추가하는 방식으로 충돌 없이 진행했습니다.

---

### 8. Optimistic UI 채택 — 북마크 / 팔로우

**배경:**
북마크와 팔로우는 서버 요청이 필요한 상태 변경입니다. 서버 응답을 기다리면 클릭 후 딜레이가 생깁니다.

**결정 이유:**
SNS에서 좋아요/북마크 같은 상호작용은 즉각적인 피드백이 UX의 핵심입니다. 서버 응답 전에 UI를 먼저 바꾸고, 실패 시 롤백하는 Optimistic UI 방식을 선택했습니다. React 19의 `useOptimistic`을 사용해 라이브러리 없이 구현할 수 있었습니다.
