# UI/UX 리디자인 — 감성/따뜻한 톤 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 크림/브라운 팔레트 + serif 헤딩 + 부드러운 카드/버튼으로 전체 UI를 따뜻하고 감성적인 톤으로 변경한다.

**Architecture:** CSS 변수(globals.css)로 컬러 토큰을 먼저 변경해 shadcn 컴포넌트 전체에 자동 적용하고, 이후 각 컴포넌트의 Tailwind 클래스를 순서대로 업데이트한다. Playfair Display 폰트는 next/font/google으로 주입한다.

**Tech Stack:** Next.js 16, Tailwind v4, shadcn/ui (base-ui 기반), next/font/google

---

## 파일 구조

| 단계 | 파일 |
|------|------|
| 1 | `frontend/app/globals.css`, `frontend/app/layout.tsx` |
| 2 | `frontend/components/ui/button.tsx` |
| 3 | `frontend/app/(main)/_components/header.tsx` |
| 4 | `frontend/app/(main)/_components/content-card.tsx` |
| 5 | `frontend/app/(main)/page.tsx` |
| 6 | `frontend/app/(main)/contents/[id]/page.tsx` |
| 7 | `frontend/app/(main)/profile/[username]/_components/profile-header.tsx`, `profile-tabs.tsx` |
| 8 | `frontend/app/(main)/profile/[username]/_components/profile-edit-form.tsx` |
| 9 | `frontend/app/(main)/_components/content-form.tsx` |
| 10 | 최종 검증 + 문서 |

---

## Task 1: 글로벌 CSS 변수 + 폰트

**Files:**
- Modify: `frontend/app/globals.css`
- Modify: `frontend/app/layout.tsx`

- [ ] **Step 1: `globals.css` `:root` 변수 교체**

`:root` 블록 전체를 아래로 교체한다:

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
    --chart-1: oklch(0.87 0 0);
    --chart-2: oklch(0.556 0 0);
    --chart-3: oklch(0.439 0 0);
    --chart-4: oklch(0.371 0 0);
    --chart-5: oklch(0.269 0 0);
    --radius: 0.875rem;
    --sidebar: oklch(0.975 0.004 90);
    --sidebar-foreground: oklch(0.21 0 0);
    --sidebar-primary: oklch(0.502 0.068 62);
    --sidebar-primary-foreground: oklch(0.981 0.003 90);
    --sidebar-accent: oklch(0.95 0.005 90);
    --sidebar-accent-foreground: oklch(0.21 0 0);
    --sidebar-border: oklch(0.90 0.008 85);
    --sidebar-ring: oklch(0.502 0.068 62);
}
```

- [ ] **Step 2: `@layer base`에 heading 폰트 추가**

`@layer base` 블록에 다음을 추가한다:

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
    }
  body {
    @apply bg-background text-foreground;
    }
  html {
    @apply font-sans;
    }
  h1, h2, h3 {
    font-family: var(--font-heading);
    }
}
```

- [ ] **Step 3: `layout.tsx` Playfair Display 추가**

`frontend/app/layout.tsx` 전체를 아래로 교체한다:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LogIt",
  description: "영화, 드라마, 책 리뷰를 작성하고 공유하는 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: 타입 확인**

```
cmd /c "cd /d D:\Backend_Bootcamp\agent_project\frontend && npx tsc --noEmit 2>&1"
```

Expected: 오류 없음

- [ ] **Step 5: Commit**

```
git -C D:\Backend_Bootcamp\agent_project add frontend/app/globals.css frontend/app/layout.tsx
git -C D:\Backend_Bootcamp\agent_project commit -m "feat: apply warm color palette and Playfair Display font"
```

---

## Task 2: Button 호버 효과

**Files:**
- Modify: `frontend/components/ui/button.tsx`

- [ ] **Step 1: `default`와 `outline` 변형에 translate 호버 추가**

`buttonVariants` cva에서 `default` 변형을 찾아 `hover:-translate-y-0.5` 추가:

```ts
default: "bg-primary text-primary-foreground hover:-translate-y-0.5 [a]:hover:bg-primary/80",
outline:
  "border-border bg-background hover:bg-muted hover:text-foreground hover:-translate-y-0.5 aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
```

- [ ] **Step 2: 타입 확인**

```
cmd /c "cd /d D:\Backend_Bootcamp\agent_project\frontend && npx tsc --noEmit 2>&1"
```

Expected: 오류 없음

- [ ] **Step 3: Commit**

```
git -C D:\Backend_Bootcamp\agent_project add frontend/components/ui/button.tsx
git -C D:\Backend_Bootcamp\agent_project commit -m "feat: add hover lift effect to button variants"
```

---

## Task 3: Header 스타일

**Files:**
- Modify: `frontend/app/(main)/_components/header.tsx`

- [ ] **Step 1: 헤더 스타일 업데이트**

읽은 후, 다음 두 부분만 수정한다.

`<header className="sticky top-0 z-50 bg-background border-b">` →

```tsx
<header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
```

`<Link href="/" className="font-bold text-lg">` →

```tsx
<Link href="/" className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
```

- [ ] **Step 2: 타입 확인**

```
cmd /c "cd /d D:\Backend_Bootcamp\agent_project\frontend && npx tsc --noEmit 2>&1"
```

- [ ] **Step 3: Commit**

```
git -C D:\Backend_Bootcamp\agent_project add "frontend/app/(main)/_components/header.tsx"
git -C D:\Backend_Bootcamp\agent_project commit -m "feat: apply warm style to header"
```

---

## Task 4: ContentCard 스타일

**Files:**
- Modify: `frontend/app/(main)/_components/content-card.tsx`

- [ ] **Step 1: 카드 Link 클래스 수정**

`<Link` 의 className을 수정한다:

기존:
```tsx
className="group block rounded-lg border hover:border-primary transition-colors overflow-hidden"
```

변경:
```tsx
className="group block rounded-2xl border border-border/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
```

- [ ] **Step 2: 타입 확인**

```
cmd /c "cd /d D:\Backend_Bootcamp\agent_project\frontend && npx tsc --noEmit 2>&1"
```

- [ ] **Step 3: Commit**

```
git -C D:\Backend_Bootcamp\agent_project add "frontend/app/(main)/_components/content-card.tsx"
git -C D:\Backend_Bootcamp\agent_project commit -m "feat: apply warm card style (rounded-2xl, shadow, lift hover)"
```

---

## Task 5: 홈 페이지

**Files:**
- Modify: `frontend/app/(main)/page.tsx`

- [ ] **Step 1: 여백 및 제목 업데이트**

`<main className="container mx-auto p-4 space-y-6">` →

```tsx
<main className="container mx-auto p-6 space-y-8">
```

`<h1 className="text-2xl font-bold">콘텐츠</h1>` →

```tsx
<h1 className="text-3xl font-bold">콘텐츠</h1>
```

- [ ] **Step 2: Commit**

```
git -C D:\Backend_Bootcamp\agent_project add "frontend/app/(main)/page.tsx"
git -C D:\Backend_Bootcamp\agent_project commit -m "feat: increase spacing and heading size on home page"
```

---

## Task 6: 콘텐츠 상세 페이지

**Files:**
- Modify: `frontend/app/(main)/contents/[id]/page.tsx`

- [ ] **Step 1: 간격 + 커버 이미지 radius 수정**

`<main className="container mx-auto p-4 max-w-2xl space-y-6">` →

```tsx
<main className="container mx-auto p-6 max-w-2xl space-y-8">
```

커버 이미지 `<div className="relative w-32 h-44 flex-shrink-0 rounded overflow-hidden border">` →

```tsx
<div className="relative w-32 h-44 flex-shrink-0 rounded-2xl overflow-hidden border border-border/60">
```

커버 이미지 없을 때 `<div className="w-32 h-44 flex-shrink-0 rounded border bg-muted ...">` →

```tsx
<div className="w-32 h-44 flex-shrink-0 rounded-2xl border border-border/60 bg-muted ...">
```

`<ul className="text-sm text-muted-foreground space-y-1">` (MetaInfo 내 모든 3개) → `space-y-2`

- [ ] **Step 2: 타입 확인**

```
cmd /c "cd /d D:\Backend_Bootcamp\agent_project\frontend && npx tsc --noEmit 2>&1"
```

- [ ] **Step 3: Commit**

```
git -C D:\Backend_Bootcamp\agent_project add "frontend/app/(main)/contents/[id]/page.tsx"
git -C D:\Backend_Bootcamp\agent_project commit -m "feat: apply warm style to content detail page"
```

---

## Task 7: ProfileHeader + ProfileTabs

**Files:**
- Modify: `frontend/app/(main)/profile/[username]/_components/profile-header.tsx`
- Modify: `frontend/app/(main)/profile/[username]/_components/profile-tabs.tsx`

- [ ] **Step 1: ProfileHeader 수정**

`profile-header.tsx`에서:

`<div className="flex items-start justify-between">` →

```tsx
<div className="flex items-start justify-between pb-2">
```

`<h1 className="text-2xl font-bold">@{profile.username}</h1>` →

```tsx
<h1 className="text-3xl font-bold">@{profile.username}</h1>
```

- [ ] **Step 2: ProfileTabs 수정**

`profile-tabs.tsx`에서 활성 탭과 호버 클래스 수정:

기존 className 내 `border-b-2 border-foreground text-foreground` → `border-b-2 border-primary text-foreground`

기존 `text-muted-foreground hover:text-foreground` → `text-muted-foreground hover:text-primary`

- [ ] **Step 3: 타입 확인**

```
cmd /c "cd /d D:\Backend_Bootcamp\agent_project\frontend && npx tsc --noEmit 2>&1"
```

- [ ] **Step 4: Commit**

```
git -C D:\Backend_Bootcamp\agent_project add "frontend/app/(main)/profile/[username]/_components/profile-header.tsx" "frontend/app/(main)/profile/[username]/_components/profile-tabs.tsx"
git -C D:\Backend_Bootcamp\agent_project commit -m "feat: apply warm style to profile header and tabs"
```

---

## Task 8: 프로필 수정 폼

**Files:**
- Modify: `frontend/app/(main)/profile/[username]/_components/profile-edit-form.tsx`
- Modify: `frontend/app/(main)/profile/[username]/edit/page.tsx`

- [ ] **Step 1: edit/page.tsx 래퍼 수정**

`<div className="mx-auto max-w-lg space-y-8 px-4 py-8">` →

```tsx
<div className="mx-auto max-w-lg space-y-8 px-4 py-8">
  <div>...</div>
  <div className="bg-card rounded-2xl shadow-sm p-6 border border-border/40">
    <ProfileEditForm profile={profile} />
  </div>
</div>
```

구체적으로 `frontend/app/(main)/profile/[username]/edit/page.tsx`를 읽고:

```tsx
  return (
    <div className="mx-auto max-w-lg space-y-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">프로필 수정</h1>
        <p className="text-sm text-muted-foreground">
          username과 자기소개를 수정할 수 있습니다.
        </p>
      </div>
      <div className="bg-card rounded-2xl shadow-sm p-6 border border-border/40">
        <ProfileEditForm profile={profile} />
      </div>
    </div>
  )
```

- [ ] **Step 2: 타입 확인**

```
cmd /c "cd /d D:\Backend_Bootcamp\agent_project\frontend && npx tsc --noEmit 2>&1"
```

- [ ] **Step 3: Commit**

```
git -C D:\Backend_Bootcamp\agent_project add "frontend/app/(main)/profile/[username]/edit/page.tsx"
git -C D:\Backend_Bootcamp\agent_project commit -m "feat: wrap profile edit form in warm card"
```

---

## Task 9: 콘텐츠 등록/수정 폼

**Files:**
- Modify: `frontend/app/(main)/contents/new/page.tsx`
- Modify: `frontend/app/(main)/contents/[id]/edit/page.tsx`

- [ ] **Step 1: `contents/new/page.tsx` 읽고 폼 래퍼 추가**

파일을 읽은 후, ContentForm을 카드 래퍼로 감싼다:

```tsx
<div className="bg-card rounded-2xl shadow-sm p-6 border border-border/40">
  <ContentForm />
</div>
```

- [ ] **Step 2: `contents/[id]/edit/page.tsx`도 동일하게 수정**

파일을 읽은 후, ContentForm을 카드 래퍼로 감싼다:

```tsx
<div className="bg-card rounded-2xl shadow-sm p-6 border border-border/40">
  <ContentForm content={content} />
</div>
```

- [ ] **Step 3: 타입 확인**

```
cmd /c "cd /d D:\Backend_Bootcamp\agent_project\frontend && npx tsc --noEmit 2>&1"
```

- [ ] **Step 4: Commit**

```
git -C D:\Backend_Bootcamp\agent_project add "frontend/app/(main)/contents/new/page.tsx" "frontend/app/(main)/contents/[id]/edit/page.tsx"
git -C D:\Backend_Bootcamp\agent_project commit -m "feat: wrap content forms in warm card"
```

---

## Task 10: 최종 검증 및 문서 정리

- [ ] **Step 1: tsc 전체 확인**

```
cmd /c "cd /d D:\Backend_Bootcamp\agent_project\frontend && npx tsc --noEmit 2>&1"
```

Expected: 오류 없음

- [ ] **Step 2: eslint 확인**

```
cmd /c "cd /d D:\Backend_Bootcamp\agent_project\frontend && npx eslint . --ext .ts,.tsx 2>&1"
```

Expected: 신규 오류/경고 없음

- [ ] **Step 3: 수동 검증**

브라우저에서 `http://localhost:3000` 확인:
1. 배경이 순백 대신 크림 톤(#FAFAF8)으로 보임
2. 헤딩(LogIt 로고, 페이지 제목)이 serif 폰트(Playfair Display)
3. 콘텐츠 카드 모서리가 둥글고(rounded-2xl) 그림자 있음
4. 카드 호버 시 살짝 위로 올라옴
5. 버튼 호버 시 살짝 올라오는 효과
6. 프로필 탭 활성 상태가 브라운 색상
7. 폼 페이지들이 카드 안에 감싸여 있음

- [ ] **Step 4: 문서 업데이트**

`docs/AI-ACTION-LOGS.md` 최상단에 추가:
```
### [31] UI/UX 리디자인 — 따뜻한 톤
- globals.css: 크림/브라운 팔레트, radius 0.875rem
- layout.tsx: Playfair Display 폰트 추가
- button.tsx: hover:-translate-y-0.5 리프트 효과
- header.tsx: backdrop-blur, LogIt serif 폰트
- content-card.tsx: rounded-2xl, shadow, 호버 리프트
- 홈/상세/프로필/폼 페이지: 여백 증가, 카드 래퍼
```

`docs/TODO-DONE.md`에 추가:
```
- [x] 전체 UI/UX 따뜻한 톤 리디자인 (크림 팔레트, serif 폰트, 부드러운 카드)
```

`docs/CONTEXT.md`:
```
**UI/UX 리디자인 완료.** 모든 주요 기능 구현 완료.
```

- [ ] **Step 5: 문서 Commit**

```
git -C D:\Backend_Bootcamp\agent_project add docs/AI-ACTION-LOGS.md docs/TODO-DONE.md docs/CONTEXT.md
git -C D:\Backend_Bootcamp\agent_project commit -m "docs: update docs for UI redesign completion"
```
