'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'

export type IntegrationType = 'notion' | 'linear' | 'google-calendar'

interface IntegrationSetupWizardProps {
  isOpen: boolean
  onClose: () => void
  integrationType: IntegrationType
}

const integrationInfo: Record<IntegrationType, {
  name: string
  icon: string
  setupSteps: { title: string; description: string; optional?: boolean }[]
}> = {
  'notion': {
    name: 'Notion',
    icon: '📝',
    setupSteps: [
      {
        title: 'Notion 워크스페이스 연결',
        description: 'OAuth 인증으로 워크스페이스에 접근 권한을 부여합니다.'
      },
      {
        title: '데이터베이스 선택',
        description: '동기화할 Tasks 데이터베이스를 선택합니다.'
      },
      {
        title: 'Property 추가 안내',
        description: '선택한 데이터베이스에 다음 Property를 추가해주세요:\n• Fotion Sync (Checkbox)\n• Fotion ID (Text)'
      },
      {
        title: '동기화 옵션 Settings',
        description: '자동 동기화 주기와 양방향 동기화 여부를 Settings합니다.',
        optional: true
      }
    ]
  },
  'linear': {
    name: 'Linear',
    icon: '📐',
    setupSteps: [
      {
        title: 'Linear 워크스페이스 연결',
        description: 'OAuth 인증으로 워크스페이스에 접근 권한을 부여합니다.'
      },
      {
        title: '프로젝트 선택',
        description: '동기화할 프로젝트를 선택합니다.'
      },
      {
        title: 'Label 추가 안내',
        description: 'Linear에서 "fotion-sync" Label을 생성하고,\n동기화하고 싶은 이슈에 이 라벨을 추가하세요.'
      },
      {
        title: '동기화 옵션 Settings',
        description: 'Workflow 상태 매핑과 자동 동기화 주기를 Settings합니다.',
        optional: true
      }
    ]
  },
  'google-calendar': {
    name: 'Google Calendar',
    icon: '📅',
    setupSteps: [
      {
        title: 'Google 계정 연결',
        description: 'OAuth 인증으로 Google Calendar 접근 권한을 부여합니다.'
      },
      {
        title: '캘린더 선택',
        description: '동기화할 캘린더를 선택합니다. (복수 선택 가능)'
      },
      {
        title: '필터 Settings',
        description: '가져올 이벤트 조건을 Settings합니다:\n• 참석 상태 (참석 중만)\n• 일정 상태 (바쁨만)\n• 키워드 필터',
        optional: true
      },
      {
        title: '동기화 옵션 Settings',
        description: '자동 동기화 주기와 Time 범위를 Settings합니다.',
        optional: true
      }
    ]
  }
}

export default function IntegrationSetupWizard({ isOpen, onClose, integrationType }: IntegrationSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const info = integrationInfo[integrationType]

  if (!isOpen) return null

  const handleNext = () => {
    if (currentStep < info.setupSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // 완료 - 실제 Settings 화면으로 이동
      onClose()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    onClose()
  }

  const currentStepData = info.setupSteps[currentStep]
  const isLastStep = currentStep === info.setupSteps.length - 1

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{info.icon}</span>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {info.name} 연동 Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              단계 {currentStep + 1} / {info.setupSteps.length}
            </span>
            {currentStepData.optional && (
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                선택사항
              </span>
            )}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / info.setupSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {currentStepData.title}
          </h3>
          <div className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
            {currentStepData.description}
          </div>

          {/* Step-specific content */}
          {integrationType === 'notion' && currentStep === 2 && (
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-3">
                💡 Property 추가 방법:
              </p>
              <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-2 list-decimal list-inside">
                <li>Notion 데이터베이스 우측 상단 "..." 클릭</li>
                <li>"Properties" 선택</li>
                <li>"+ New property" 클릭</li>
                <li>이름: "Fotion Sync", 타입: Checkbox</li>
                <li>다시 "+ New property" 클릭</li>
                <li>이름: "Fotion ID", 타입: Text</li>
              </ol>
            </div>
          )}

          {integrationType === 'linear' && currentStep === 2 && (
            <div className="mt-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <p className="text-sm text-purple-800 dark:text-purple-200 font-medium mb-3">
                💡 Label 추가 방법:
              </p>
              <ol className="text-sm text-purple-700 dark:text-purple-300 space-y-2 list-decimal list-inside">
                <li>Linear 좌측 하단 Settings (⚙️) 클릭</li>
                <li>"Labels" 메뉴 선택</li>
                <li>"Create label" 클릭</li>
                <li>이름: "fotion-sync" 입력</li>
                <li>원하는 Color 선택 후 생성</li>
                <li>동기화할 이슈에 이 라벨 추가</li>
              </ol>
            </div>
          )}

          {integrationType === 'google-calendar' && currentStep === 2 && (
            <div className="mt-6 space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-800 dark:text-green-200 font-medium mb-2">
                  💡 추천 필터 Settings:
                </p>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1 list-disc list-inside">
                  <li>참석 상태: "참석 중"만 선택 (초대받은 일정 제외)</li>
                  <li>일정 상태: "바쁨"만 선택 (가용 Time 제외)</li>
                  <li>키워드: "[Focus]" 포함 이벤트만 가져오기</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSkip}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium"
          >
            나중에 Settings하기
          </button>
          <div className="flex space-x-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
              >
                이전
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {isLastStep ? 'Settings Start하기' : '다음'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
