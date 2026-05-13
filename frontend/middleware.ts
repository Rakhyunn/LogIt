import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { type Database } from '@/types/database'

const AUTH_PAGES = ['/login', '/signup', '/forgot-password', '/reset-password']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // OAuth 콜백은 미들웨어 보호 제외
  if (pathname.startsWith('/auth/callback')) return supabaseResponse

  // Auth 페이지: 로그인 상태면 홈으로
  if (AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    if (user) return NextResponse.redirect(new URL('/', request.url))
    return supabaseResponse
  }

  // 보호 라우트: 비로그인 시 로그인 페이지로
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  // 프로필 미설정 시 setup 페이지로 (무한 루프 방지)
  if (pathname !== '/profile/setup') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_profile_setup')
      .eq('id', user.id)
      .single()

    if (profile && !profile.is_profile_setup) {
      return NextResponse.redirect(new URL('/profile/setup', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
