const LANGUAGE_KEY = "user_language"

export const getUserLanguage = (): string => {
  if (typeof window === "undefined") return "en"

  // localStorage에서 저장된 언어 설정 확인
  const savedLanguage = localStorage.getItem(LANGUAGE_KEY)
  if (savedLanguage) return savedLanguage

  // navigator.language 사용 (예: en-US, ko-KR 등)
  return navigator.language || "en"
}

export const setUserLanguage = (language: string): void => {
  if (typeof window === "undefined") return
  localStorage.setItem(LANGUAGE_KEY, language)
}

// 지원하는 언어-지역 목록
export const SUPPORTED_LANGUAGES = ["en-US", "en-GB", "ko-KR", "ja-JP", "zh-CN", "zh-TW"] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]
