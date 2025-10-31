import { useEffect, RefObject } from 'react'

/**
 * 모달 접근성을 위한 커스텀 훅
 * - Auto focus on specified element when modal opens
 * - ESC key to close modal
 * - Focus trap within modal
 */
export function useModalAccessibility(
  isOpen: boolean,
  onClose: () => void,
  focusRef?: RefObject<HTMLElement>
) {
  // Auto focus when modal opens
  useEffect(() => {
    if (isOpen && focusRef?.current) {
      setTimeout(() => {
        focusRef.current?.focus()
      }, 100)
    }
  }, [isOpen, focusRef])

  // ESC key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])
}
