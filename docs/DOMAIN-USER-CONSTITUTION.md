# DOMAIN-USER-CONSTITUTION — 유저/프로필 도메인 원칙

---

1. **프로필은 인증 유저와 1:1 매핑** — `profiles.id = auth.users.id` (Supabase Auth UID). 유저당 프로필은 반드시 1개이며 별도 생성 API는 두지 않는다.

2. **최초 로그인 시 프로필 설정 필수** — `is_profile_setup = false`인 유저는 미들웨어가 `/profile/setup`으로 강제 리다이렉트한다. 프로필 설정 전에는 다른 기능에 접근할 수 없다.

3. **username은 시스템 전체 고유 식별자** — 영문·숫자·밑줄만 허용, 2~30자, DB `UNIQUE` 제약으로 보장한다. URL 경로(`/profile/[username]`)에 직접 사용된다.

4. **프로필 수정은 본인만 가능** — RLS가 1차 강제하며, Server Action에서 `getUser()`로 재검증한다. 타인의 프로필 수정 시도는 DB 레벨에서 차단된다.

5. **팔로우는 단방향** — `follows(follower_id, following_id)` 테이블로 표현하며 맞팔 여부는 애플리케이션 레벨에서 조회한다. 자기 자신은 팔로우할 수 없다.
