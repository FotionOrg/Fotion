import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken } from '@/lib/notion'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  // 에러 처리
  if (error) {
    const redirectUrl = new URL('/', request.url)
    redirectUrl.searchParams.set('notion_error', error)
    return NextResponse.redirect(redirectUrl)
  }

  // Authorization code가 없으면 에러
  if (!code) {
    const redirectUrl = new URL('/', request.url)
    redirectUrl.searchParams.set('notion_error', 'no_code')
    return NextResponse.redirect(redirectUrl)
  }

  try {
    // Authorization code를 access token으로 교환
    const token = await exchangeCodeForToken(code)

    // 토큰을 URL 파라미터로 전달 (MVP 방식)
    // 실제 프로덕션에서는 세션이나 쿠키 사용 권장
    const redirectUrl = new URL('/', request.url)
    const tokenData = Buffer.from(JSON.stringify(token)).toString('base64')
    redirectUrl.searchParams.set('notion_token', tokenData)

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Notion OAuth error:', error)
    const redirectUrl = new URL('/', request.url)
    redirectUrl.searchParams.set('notion_error', 'exchange_failed')
    return NextResponse.redirect(redirectUrl)
  }
}
