# TODO-READY — 바로 작업 가능한 목록

---

## 도메인 문서 작성 (구현 전 필수)

> CLAUDE.md 규칙: 도메인 문서 없이 해당 도메인 기능을 구현하지 마라.
> 각 도메인마다 CONSTITUTION.md + STATUTE.md 생성 필요.

- [x] docs/DOMAIN-COMMON-CONSTITUTION.md 작성 (공통 원칙 채우기)
- [x] docs/DOMAIN-COMMON-STATUTE.md 작성 (공통 규칙 채우기)
- [x] docs/DOMAIN-AUTH-CONSTITUTION.md 생성 (인증 도메인 원칙)
- [x] docs/DOMAIN-AUTH-STATUTE.md 생성 (인증 도메인 규칙)
- [x] docs/DOMAIN-CONTENT-CONSTITUTION.md 생성 (콘텐츠 도메인 원칙)
- [x] docs/DOMAIN-CONTENT-STATUTE.md 생성 (콘텐츠 도메인 규칙)
- [x] docs/DOMAIN-REVIEW-CONSTITUTION.md 생성 (리뷰 도메인 원칙)
- [x] docs/DOMAIN-REVIEW-STATUTE.md 생성 (리뷰 도메인 규칙)
- [x] docs/DOMAIN-USER-CONSTITUTION.md 생성 (유저/프로필 도메인 원칙)
- [x] docs/DOMAIN-USER-STATUTE.md 생성 (유저/프로필 도메인 규칙)
- [x] docs/DOMAIN-BOOKMARK-CONSTITUTION.md 생성 (북마크 도메인 원칙)
- [x] docs/DOMAIN-BOOKMARK-STATUTE.md 생성 (북마크 도메인 규칙)

## 공통 네비게이션 (Bookmark 도메인 이후)

> 현재 `(main)/layout.tsx`는 pass-through. 테스트 완료 후 설계 예정.

- [x] 글로벌 네비게이션 브레인스토밍
- [x] `app/(main)/layout.tsx` 네비게이션 헤더 구현

## UX 개선 (마지막 작업)

- [ ] 홈 페이지 `+ 등록` 버튼 제거 (헤더에 이미 존재, 중복)
- [ ] 아바타 이미지 업로드 + 위치 조정 (avatars 버킷, object-position, profiles.avatar_position 컬럼 추가)
- [ ] 로딩/에러 상태 처리
- [ ] 반응형 레이아웃

## 아키텍처 문서 작성

- [x] docs/ARCHITECTURE-CONSTITUTION.md 작성 (아키텍처 핵심 원칙 채우기)
- [x] docs/ARCHITECTURE-STATUTE.md 작성 (아키텍처 구현 규칙 채우기)
