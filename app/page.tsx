import HomeClient from '@/components/HomeClient'

/**
 * 서버 컴포넌트
 * React Query가 데이터를 자동으로 fetch하므로 초기 데이터 불필요
 */
export default function Home() {
  return <HomeClient />
}
