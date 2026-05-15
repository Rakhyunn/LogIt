# AI-MAJOR-EVENT — 주요 사건 및 의사결정

---

## 2026-05-15 — 배포 후 성능 트러블슈팅

### [TROUBLESHOOTING] Vercel 배포 환경에서 응답 속도 저하

**현상**
- 로컬 개발 환경 대비 Vercel 배포 환경에서 클릭 후 응답이 눈에 띄게 느림
- 특히 콘텐츠 상세 페이지, 북마크/팔로우 인터랙션에서 체감

**원인 분석**
Vercel은 서버리스 함수 환경이므로 로컬과 달리 DB 커넥션을 재사용하지 않음.
그 위에 코드 레벨의 불필요한 쿼리가 더해져 체감 지연이 증폭됨.

| # | 위치 | 문제 | 영향 |
|---|------|------|------|
| 1 | `review-section.tsx` | `reviews` 조회 후 `profiles`를 별도 순차 쿼리 (2 round trips) | 콘텐츠 상세 페이지 로드마다 DB 왕복 1회 추가 |
| 2 | `app/(main)/page.tsx` | 홈 북마크 조회 시 유저의 전체 북마크를 가져온 뒤 JS에서 필터 | 북마크가 많을수록 불필요한 데이터 전송 증가 |

**적용한 수정**

1. `review-section.tsx` — Supabase JOIN 쿼리로 2 round trips → 1회
   ```
   .select('*')  →  .select('*, profiles(username)')
   + profiles 별도 쿼리 제거
   ```

2. `app/(main)/page.tsx` — 북마크 쿼리에 `.in('content_id', contentIds)` 추가
   ```
   전체 북마크 조회  →  현재 화면의 콘텐츠 ID만 필터링
   ```

**미적용 개선 사항 (향후 검토)**
- Server Component에서 `getUser()` → `getSession()` 전환: auth 서버 왕복 제거 가능하나 미들웨어 의존성 명확화 필요
- 홈 `select('*')` → 필요 컬럼만 선택: ContentCard 타입 변경 수반, 별도 리팩토링으로 진행
- `revalidatePath('/profile', 'layout')` → 특정 username 경로로 narrowing: followUser 액션 시그니처 변경 필요

---

## 2026-05-14 — UX/UI 완성

### 앱 이름 결정
- **결정:** 앱 이름을 **LogIt**으로 확정
- **이유:** 사용자 직접 결정
- **영향:** layout.tsx 메타데이터, 헤더 로고 텍스트 변경

### UI/UX 디자인 방향 결정 — 따뜻한 톤
- **결정:** 크림/오프화이트 베이스(#FAFAF8), 브라운 포인트(#8B6F47), serif 헤딩(Playfair Display), 부드러운 카드(rounded-2xl, shadow)
- **이유:** Readwise/Airbnb/Notion 라이트모드 레퍼런스 참고. 감성적이고 따뜻한 분위기 지향
- **영향:** globals.css CSS 변수 전면 변경, layout.tsx 폰트 추가, 주요 컴포넌트 스타일 업데이트

### 아바타 위치 조정 방식 결정
- **결정:** 업로드 후 원형 미리보기 안에서 드래그로 focal point 조정. `object-position: x% y%` CSS로 저장
- **이유:** 라이브러리 없이 순수 마우스 이벤트로 구현. 의존성 최소화
- **영향:** `profiles.avatar_position jsonb` 컬럼 추가, AvatarUpload Client Component 구현

### 네비게이션 버튼 중복 제거 결정
- **결정:** 홈 페이지의 `+ 등록` 버튼 제거. 헤더 네비게이션에만 유지
- **이유:** 헤더에 이미 동일 기능 버튼 존재 → UX 중복
- **영향:** `app/(main)/page.tsx` 버튼 제거

---

## 2026-05-13 — 핵심 도메인 구현

### Bookmark Optimistic UI 패턴 결정
- **결정:** `useOptimistic` + `useTransition` + `router.refresh()` 조합. 실패 시 자동 롤백
- **이유:** Next.js 15+ 표준 패턴. BookmarkButton → FollowButton으로 동일 패턴 재사용
- **영향:** 모든 인터랙티브 토글 버튼이 동일 패턴 사용

### ContentCard bookmarkSlot render prop 결정
- **결정:** ContentCard가 `bookmarkSlot?: React.ReactNode`를 받아 렌더링. 북마크 도메인 로직은 ContentCard 외부에서 주입
- **이유:** ContentCard가 특정 도메인에 직접 의존하지 않도록 분리 (DOMAIN-COMMON-CONSTITUTION 원칙)
- **영향:** 홈 페이지에서 북마크 상태 일괄 조회 후 슬롯으로 전달

### 타인 프로필 북마크 탭 숨김 결정
- **결정:** 본인 프로필에서만 북마크 탭 표시. 타인 프로필에서는 숨김
- **이유:** RLS가 `user_id = auth.uid()` 조건으로 걸려 타인 북마크 조회 불가 → 빈 탭 표시 대신 탭 자체 숨김이 자연스러움
- **영향:** `ProfileTabs.isOwner` prop 추가

---

## 2026-05-12 — 프로젝트 초기화

### 기술 스택 결정
- **결정:** Next.js 16.2.6 (App Router, TypeScript), Supabase Cloud, Tailwind CSS v4, shadcn/ui
- **이유:** 사용자 요구사항 확정 (브레인스토밍 세션)
- **영향:** 전체 아키텍처 기반

### DB 스키마 설계 결정
- **결정:** contents 테이블에 `created_by uuid` 컬럼 추가
- **이유:** 최초 설계에서 소유권 컬럼 누락 → 코드 리뷰에서 발견. 인증된 유저 누구나 콘텐츠를 수정/삭제할 수 있는 보안 취약점.
- **영향:** contents RLS UPDATE/DELETE 정책이 `created_by = auth.uid()` 기반으로 변경됨

### username 충돌 방지 전략 결정
- **결정:** `handle_new_user` 트리거에서 username을 `email_prefix + '_' + uuid[:6]`으로 생성
- **이유:** email prefix만 사용하면 동일 prefix 유저 2번째 가입 시 UNIQUE 제약 위반으로 가입 실패
- **영향:** username이 사람이 읽기 어려운 형태가 될 수 있음. 향후 프로필 설정 페이지에서 username 변경 기능 필요

### RLS WITH CHECK 정책 보완
- **결정:** reviews_update_own, contents_update_own에 WITH CHECK 추가
- **이유:** USING만 있으면 UPDATE 시 다른 user_id로 소유권 이전 가능한 보안 취약점
- **영향:** 모든 소유권 기반 UPDATE 정책에 WITH CHECK 적용
