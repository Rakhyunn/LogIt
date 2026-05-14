# AI-MAJOR-EVENT-RECAP — 주요 사건 요약

---

## 2026-05-14

| 날짜 | 사건 | 결과 |
|------|------|------|
| 2026-05-14 | 앱 이름 LogIt으로 확정 | 헤더 로고 + 메타데이터 변경 |
| 2026-05-14 | UI/UX 따뜻한 톤 결정 | 크림/브라운 팔레트, Playfair Display, rounded-2xl 카드 |
| 2026-05-14 | 아바타 drag focal point 방식 결정 | object-position CSS, profiles.avatar_position jsonb |
| 2026-05-14 | 홈 등록 버튼 중복 제거 | 헤더에만 유지 |

## 2026-05-13

| 날짜 | 사건 | 결과 |
|------|------|------|
| 2026-05-13 | Bookmark Optimistic UI 패턴 확립 | useOptimistic + useTransition, FollowButton도 동일 패턴 |
| 2026-05-13 | ContentCard render prop 패턴 결정 | bookmarkSlot 슬롯으로 도메인 분리 |
| 2026-05-13 | 타인 프로필 북마크 탭 숨김 결정 | ProfileTabs.isOwner prop, RLS 기반 |

## 2026-05-12

| 날짜 | 사건 | 결과 |
|------|------|------|
| 2026-05-12 | 기술 스택 확정 | Next.js 16 + Supabase Cloud + Tailwind v4 + shadcn/ui |
| 2026-05-12 | contents 소유권 컬럼 누락 발견 | created_by 컬럼 추가, RLS 정책 수정 |
| 2026-05-12 | username UNIQUE 충돌 위험 발견 | email_prefix + uuid[:6] 방식으로 변경 |
| 2026-05-12 | RLS WITH CHECK 누락 발견 | UPDATE 정책 전체 보완 |
