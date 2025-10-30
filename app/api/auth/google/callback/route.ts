import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromCode } from '@/lib/google-calendar'

/**
 * Google OAuth 콜백 엔드포인트
 * 인증 후 리디렉션되는 곳
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    // 사용자가 인증을 거부한 경우
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error)}`, request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/?error=no_code', request.url)
    )
  }

  try {
    // 인증 코드로 토큰 교환
    const token = await getTokenFromCode(code)

    // 토큰을 클라이언트로 전달 (실제로는 서버에 저장하거나 암호화된 쿠키 사용)
    // MVP이므로 URL 파라미터로 전달 (프로덕션에서는 보안 강화 필요)
    const redirectUrl = new URL('/', request.url)
    redirectUrl.searchParams.set('google_auth', 'success')
    redirectUrl.searchParams.set('token', Buffer.from(JSON.stringify(token)).toString('base64'))

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Failed to exchange code for token:', error)
    return NextResponse.redirect(
      new URL('/?error=token_exchange_failed', request.url)
    )
  }
}
