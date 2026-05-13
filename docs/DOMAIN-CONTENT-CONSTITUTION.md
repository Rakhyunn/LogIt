# DOMAIN-CONTENT-CONSTITUTION — 콘텐츠 도메인 원칙

---

1. **콘텐츠는 공개 자원** — 콘텐츠 목록과 상세는 비로그인 유저도 조회 가능하다. 단, 현재 미들웨어가 (main)/* 전체를 보호하므로 로그인 유저만 접근한다. 추후 공개 전환 시 미들웨어만 수정한다.

2. **등록/수정/삭제는 인증 필수** — 콘텐츠 등록은 로그인 유저 누구나 가능하다. 수정/삭제는 `created_by`가 본인인 경우만 허용하며 RLS가 1차로 강제한다.

3. **이미지는 선택, 클라이언트에서 직접 업로드** — 커버 이미지는 선택 항목이다. 이미지를 첨부한 경우 브라우저에서 Supabase Storage에 직접 업로드하고 URL만 Server Action으로 전달한다. 이미지 업로드에 한해 클라이언트 Supabase 클라이언트 사용을 허용한다.

4. **타입별 metadata 구조** — `metadata` 필드는 콘텐츠 타입에 따라 다른 구조를 가진다.
   - `movie`: `{ director, release_year, genres }`
   - `drama`: `{ director, air_year, episodes, genres }`
   - `book`: `{ author, publish_year, publisher }`

5. **초기 데이터는 seed 스크립트로 관리** — 기본 콘텐츠 데이터는 Supabase 마이그레이션 seed 파일로 관리한다.
