# 로딩/에러 상태 처리 설계 스펙

**Goal:** 프로필, 프로필 수정, 콘텐츠 등록/수정 페이지에 loading/error 파일을 추가하고, 기존 error.tsx를 아이콘+메시지+버튼 구조로 개선한다.

**Date:** 2026-05-14

---

## 에러 UI 공통 구조

```tsx
<main className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
  <AlertCircle className="h-12 w-12 text-destructive" />
  <p className="text-muted-foreground">{메시지}</p>
  <div className="flex gap-3">
    <Button variant="outline" onClick={reset}>다시 시도</Button>
    <Button asChild variant="ghost"><Link href="/">홈으로</Link></Button>
  </div>
</main>
```

### 페이지별 메시지
| 파일 | 메시지 |
|------|--------|
| `app/(main)/error.tsx` | 페이지를 불러오는데 실패했습니다. |
| `app/(main)/contents/[id]/error.tsx` | 콘텐츠를 불러오는데 실패했습니다. |
| `app/(main)/profile/[username]/error.tsx` | 프로필을 불러오는데 실패했습니다. |

---

## 로딩 스켈레톤

### 프로필 페이지 (상세 스켈레톤)

`app/(main)/profile/[username]/loading.tsx`

```
<div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
  <!-- 프로필 헤더 -->
  <div className="flex items-start justify-between">
    <div className="flex items-start gap-4">
      <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
      <div className="space-y-2">
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        <div className="h-4 w-36 bg-muted rounded animate-pulse" />
      </div>
    </div>
    <div className="h-8 w-20 bg-muted rounded animate-pulse" />
  </div>
  <!-- 탭 -->
  <div className="h-10 border-b bg-muted/30 animate-pulse" />
  <!-- 리스트 3개 -->
  {[1,2,3].map(i => <div key={i} className="h-20 rounded-lg border bg-muted animate-pulse" />)}
</div>
```

### 폼 페이지 공통 스켈레톤 (단순)

`profile/[username]/edit/loading.tsx`, `contents/new/loading.tsx`, `contents/[id]/edit/loading.tsx` — 동일 패턴:

```
<div className="mx-auto max-w-lg space-y-8 px-4 py-8">
  <div className="h-8 w-40 bg-muted rounded animate-pulse" />  <!-- 타이틀 -->
  <div className="space-y-4">
    {[1,2,3,4].map(i => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}
  </div>
  <div className="h-10 bg-muted rounded animate-pulse" />  <!-- 버튼 -->
</div>
```

---

## 수정/신규 파일 목록

| 상태 | 파일 |
|------|------|
| 수정 | `app/(main)/error.tsx` |
| 수정 | `app/(main)/contents/[id]/error.tsx` |
| 신규 | `app/(main)/profile/[username]/error.tsx` |
| 신규 | `app/(main)/profile/[username]/loading.tsx` |
| 신규 | `app/(main)/profile/[username]/edit/loading.tsx` |
| 신규 | `app/(main)/contents/new/loading.tsx` |
| 신규 | `app/(main)/contents/[id]/edit/loading.tsx` |
