# UI/UX 리디자인 스펙 — 감성/따뜻한 톤

**Goal:** 전체 UI를 크림/브라운 팔레트 + serif 헤딩 + 부드러운 카드/버튼으로 변경해 Readwise/Notion 스타일의 따뜻하고 감성적인 분위기를 만든다.

**Date:** 2026-05-14

---

## 컬러 팔레트

| 역할 | 헥스 | oklch |
|------|------|-------|
| 배경 (background) | #FAFAF8 | oklch(0.981 0.003 90) |
| 텍스트 (foreground) | #2C2C2C | oklch(0.21 0 0) |
| 포인트 (primary) | #8B6F47 | oklch(0.502 0.068 62) |
| 포인트 텍스트 | #FAFAF8 | oklch(0.981 0.003 90) |
| muted 배경 | — | oklch(0.95 0.005 90) |
| muted 텍스트 | — | oklch(0.48 0.02 60) |
| 보더 | — | oklch(0.90 0.008 85) |

---

## Phase 1: 글로벌 기반 (`globals.css` + `layout.tsx`)

### `globals.css` `:root` 변경
```css
:root {
  --background: oklch(0.981 0.003 90);
  --foreground: oklch(0.21 0 0);
  --card: oklch(0.981 0.003 90);
  --card-foreground: oklch(0.21 0 0);
  --popover: oklch(0.981 0.003 90);
  --popover-foreground: oklch(0.21 0 0);
  --primary: oklch(0.502 0.068 62);
  --primary-foreground: oklch(0.981 0.003 90);
  --secondary: oklch(0.95 0.005 90);
  --secondary-foreground: oklch(0.21 0 0);
  --muted: oklch(0.95 0.005 90);
  --muted-foreground: oklch(0.48 0.02 60);
  --accent: oklch(0.95 0.005 90);
  --accent-foreground: oklch(0.21 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.90 0.008 85);
  --input: oklch(0.90 0.008 85);
  --ring: oklch(0.502 0.068 62);
  --radius: 0.875rem;
}
```

### `globals.css` @layer base 추가
```css
h1, h2, h3 {
  font-family: var(--font-heading);
}
```

### `layout.tsx` 폰트 추가
```ts
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google'

const playfair = Playfair_Display({
  variable: '--font-heading',
  subsets: ['latin'],
})
// html className에 playfair.variable 추가
```

---

## Phase 2: Header (`header.tsx`)

변경:
- `bg-background border-b` → `bg-background/95 backdrop-blur-sm border-b border-border/50`
- LogIt 로고: `font-bold text-lg` → `font-bold text-xl` + `font-[family-name:var(--font-heading)]`

---

## Phase 3: ContentCard (`content-card.tsx`)

변경:
- `rounded-lg border hover:border-primary` → `rounded-2xl border border-border/60 shadow-sm hover:shadow-md`
- `overflow-hidden` 유지
- 호버: `hover:-translate-y-0.5 transition-all duration-200` 추가
- 카드 내부 타입 텍스트, 제목 패딩 유지

---

## Phase 4: 홈 페이지 (`app/(main)/page.tsx`)

변경:
- `<h1>` → 자동으로 heading 폰트 적용 (Phase 1에서 처리)
- `space-y-6` → `space-y-8` (여백 증가)

---

## Phase 5: 콘텐츠 상세 페이지 (`contents/[id]/page.tsx`)

변경:
- `space-y-6` → `space-y-8`
- 커버 이미지 `rounded overflow-hidden` → `rounded-2xl overflow-hidden`
- MetaInfo `<ul>` 간격 `space-y-1` → `space-y-2`

---

## Phase 6: ProfileHeader (`profile-header.tsx`)

변경:
- 전체 래퍼에 `pb-4` 추가
- `@{username}` h1: heading 폰트 자동 적용
- 팔로워/팔로잉 텍스트: `text-sm` 유지

---

## Phase 7: ProfileTabs (`profile-tabs.tsx`)

변경:
- 활성 탭 `border-b-2 border-foreground` → `border-b-2 border-primary`
- 비활성 탭 호버: `hover:text-primary`

---

## Phase 8: 프로필 수정 폼 + 콘텐츠 폼

변경 (폼 공통):
- 폼 래퍼에 `bg-card rounded-2xl shadow-sm p-6` 추가
- Input/Textarea: `rounded-xl` (radius 증가)

---

## 버튼 전역 (Phase 1에서 CSS 변수로 처리)

shadcn Button `default` 변형이 `primary` 색상을 사용하므로 Phase 1에서 `--primary`를 브라운으로 변경하면 자동 적용.

호버 translate 효과: `frontend/components/ui/button.tsx`의 `buttonVariants`에서 `default`와 `outline` 변형에 `hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-150` 클래스 추가.

---

## 적용 순서 요약

| 단계 | 파일 |
|------|------|
| 1 | `frontend/app/globals.css` + `frontend/app/layout.tsx` |
| 2 | `frontend/app/(main)/_components/header.tsx` |
| 3 | `frontend/app/(main)/_components/content-card.tsx` |
| 4 | `frontend/app/(main)/page.tsx` |
| 5 | `frontend/app/(main)/contents/[id]/page.tsx` |
| 6 | `frontend/app/(main)/profile/[username]/_components/profile-header.tsx` |
| 7 | `frontend/app/(main)/profile/[username]/_components/profile-tabs.tsx` |
| 8 | `frontend/app/(main)/profile/[username]/_components/profile-edit-form.tsx` |
| 9 | `frontend/app/(main)/_components/content-form.tsx` |
