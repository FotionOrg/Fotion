#!/bin/bash

# Fotion macOS 설치 스크립트
# 이 스크립트는 Gatekeeper 경고를 우회하여 Fotion을 설치합니다

set -e

echo "🚀 Fotion 설치를 시작합니다..."

# DMG 파일 찾기
DMG_FILE=$(ls -t ~/Downloads/Fotion-*.dmg 2>/dev/null | head -1)

if [ -z "$DMG_FILE" ]; then
    echo "❌ 오류: Downloads 폴더에서 Fotion DMG 파일을 찾을 수 없습니다."
    echo "   Fotion DMG를 다운로드한 후 다시 실행해주세요."
    exit 1
fi

echo "✅ DMG 파일 발견: $DMG_FILE"

# Gatekeeper 속성 제거
echo "🔓 보안 속성 제거 중..."
xattr -cr "$DMG_FILE"

# DMG 마운트
echo "📦 DMG 마운트 중..."
MOUNT_POINT=$(hdiutil attach "$DMG_FILE" | grep Volumes | awk '{print $3}')

if [ -z "$MOUNT_POINT" ]; then
    echo "❌ DMG 마운트 실패"
    exit 1
fi

echo "✅ 마운트 완료: $MOUNT_POINT"

# 앱 복사
echo "📂 Applications 폴더로 복사 중..."
cp -R "$MOUNT_POINT/Fotion.app" /Applications/

# Gatekeeper 속성 제거 (앱 자체)
echo "🔓 앱 보안 속성 제거 중..."
xattr -cr /Applications/Fotion.app

# DMG 언마운트
echo "🔚 정리 중..."
hdiutil detach "$MOUNT_POINT" -quiet

echo ""
echo "✅ 설치 완료!"
echo "🎉 이제 Applications 폴더에서 Fotion을 실행할 수 있습니다."
echo ""
echo "💡 팁: Dock에 추가하려면 Applications 폴더에서 Fotion을 Dock으로 드래그하세요."
