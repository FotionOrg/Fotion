# Fotion 설치 가이드

## macOS

### ⚡ 빠른 설치 (터미널 사용)

```bash
# 1. DMG 다운로드 후
xattr -cr ~/Downloads/Fotion-*.dmg

# 2. DMG 열고 Applications로 복사
open ~/Downloads/Fotion-*.dmg

# 3. 앱 복사 후
xattr -cr /Applications/Fotion.app

# 4. 실행
open /Applications/Fotion.app
```

### 📦 자동 설치 스크립트

```bash
# GitHub Release에서 install-mac.sh 다운로드 후
chmod +x install-mac.sh
./install-mac.sh
```

### ❓ "손상되었기 때문에 열 수 없습니다" 에러가 뜨나요?

**해결방법 (가장 쉬운 순서):**

1. **터미널 사용 (3초 해결):**
   ```bash
   xattr -cr /Applications/Fotion.app
   ```

2. **우클릭으로 열기:**
   - Applications 폴더에서 Fotion.app **우클릭**
   - **열기** 선택
   - 경고 창에서 **열기** 클릭

3. **시스템 설정:**
   - 시스템 설정 → 개인정보 보호 및 보안
   - "확인 없이 열기" 클릭

> **왜 이런 경고가 뜨나요?**
> Apple Developer 인증서 ($99/년)로 코드 서명이 되지 않았기 때문입니다.
> 소스 코드는 GitHub에 100% 공개되어 있으며, 누구나 검증할 수 있습니다.

## Windows

1. `Fotion-Setup-*.exe` 다운로드
2. 설치 프로그램 실행
3. Windows Defender 경고가 나타나면:
   - "추가 정보" 클릭
   - "실행" 클릭

## 다운로드

최신 버전: [GitHub Releases](https://github.com/FotionOrg/Fotion/releases/latest)

---

## 문제 해결

### macOS: 앱이 실행되지 않아요

```bash
# 모든 권한 문제 한 번에 해결
xattr -cr /Applications/Fotion.app
sudo spctl --master-disable  # Gatekeeper 완전 비활성화 (선택사항)
```

### Windows: SmartScreen 경고

- "추가 정보" → "실행" 클릭
- 또는 설정 → Windows 보안 → 앱 및 브라우저 제어

### 여전히 안 되나요?

[이슈 제보](https://github.com/FotionOrg/Fotion/issues)
