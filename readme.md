# How to Contribute

## Prerequisite

- Node.js v22.14.0 이상
    - vercel에서 현재 v23을 지원하지 않음
    - nvm을 활용하면 여러 node.js 가상환경 활용 가능

## How to run


1. 프로젝트 루트 경로에 .env.local 파일 생성 후 관리자로부터 시크릿을 전달받아 입력합니다.
2. `npm install` 명령어로 패키지를 설치합니다.
3. `npm run dev` 명령어로 개발 서버를 실행합니다.

## Notice for Development

1. local 환경 env environment는 관리자에게 요청합니다.
2. prod 환경 env는 vercel에서 관리되고 있습니다.
3. local 환경에서 로그인을 진행하려면 superbase에서 redirect_url을 수정해야합니다. [여기](https://supabase.com/dashboard/project/qbvcwhzupopjzhqwsjlx/auth/url-configuration)에 접속 후 Site URL을 "http://localhost:3000"으로 수정합니다. 현재 런칭 상태가 아니기에 localhost를 기본으로하고, 상용 환경 QA를 진행할 때만 이를 "https://chirpify.app"으로 수정합니다.

# 패키지 구성

주요 폴더
- app: 화면 구성에 대한 전반 로직
- be: 백엔드 관련 코어 로직, next.js와의 의존성이 분리됨.
- components: 재사용 가능한 UI 컴포넌트
- lib: 
    - fe: next.js client에서 사용할 수 있는 로직
    - be: next.js server를 의존하는 서버 로직(e.g. session 관리 등)
- public: 정적 파일