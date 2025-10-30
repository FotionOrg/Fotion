'use client'

import React, { useState } from 'react'
import { Plus, CheckCircle, AlertCircle, Settings } from 'lucide-react'
import IntegrationSetupWizard, { IntegrationType } from './IntegrationSetupWizard'
import GoogleCalendarSync from './GoogleCalendarSync'
import NotionSync from './NotionSync'

interface Integration {
  id: IntegrationType
  name: string
  icon: string
  description: string
  status: 'connected' | 'disconnected' | 'error'
  tagRequirement: string
  setupTime: string
}

const integrations: Integration[] = [
  {
    id: 'notion',
    name: 'Notion',
    icon: '📝',
    description: 'Notion 데이터베이스의 작업을 동기화합니다',
    status: 'disconnected',
    tagRequirement: 'Fotion Sync (Checkbox Property)',
    setupTime: '2분'
  },
  {
    id: 'linear',
    name: 'Linear',
    icon: '📐',
    description: 'Linear 이슈를 작업으로 가져옵니다',
    status: 'disconnected',
    tagRequirement: 'fotion-sync (Label)',
    setupTime: '2분'
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    icon: '📅',
    description: '캘린더 일정을 작업으로 변환합니다',
    status: 'disconnected',
    tagRequirement: '캘린더 선택만',
    setupTime: '1분'
  }
]

export default function IntegrationsHub() {
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationType | null>(null)
  const [isWizardOpen, setIsWizardOpen] = useState(false)

  const handleStartSetup = (integrationId: IntegrationType) => {
    setSelectedIntegration(integrationId)
    setIsWizardOpen(true)
  }

  const handleCloseWizard = () => {
    setIsWizardOpen(false)
    setSelectedIntegration(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          외부 서비스 연동
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          기존 프로젝트에 태그만 추가하면 자동으로 동기화됩니다
        </p>
      </div>

      {/* Quick Setup Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">💡</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              빠른 연동 방법
            </p>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• <strong>Notion</strong>: 데이터베이스에 "Fotion Sync" Property 추가</li>
              <li>• <strong>Linear</strong>: "fotion-sync" Label 생성 후 이슈에 추가</li>
              <li>• <strong>Google Calendar</strong>: 동기화할 캘린더만 선택</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            {/* Icon and Status */}
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">{integration.icon}</div>
              {integration.status === 'connected' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : integration.status === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-500" />
              ) : null}
            </div>

            {/* Name and Description */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {integration.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {integration.description}
            </p>

            {/* Tag Requirement */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                필요한 설정:
              </p>
              <div className="bg-gray-100 dark:bg-gray-700 rounded px-2 py-1">
                <code className="text-xs text-gray-700 dark:text-gray-300">
                  {integration.tagRequirement}
                </code>
              </div>
            </div>

            {/* Setup Time */}
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
              ⏱️ 설정 시간: 약 {integration.setupTime}
            </p>

            {/* Action Buttons */}
            {integration.status === 'connected' ? (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleStartSetup(integration.id)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>설정</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleStartSetup(integration.id)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>연동 시작</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Active Integrations Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          현재 활성화된 연동
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NotionSync />
          <GoogleCalendarSync />
        </div>
      </div>

      {/* Setup Wizard Modal */}
      {selectedIntegration && (
        <IntegrationSetupWizard
          isOpen={isWizardOpen}
          onClose={handleCloseWizard}
          integrationType={selectedIntegration}
        />
      )}
    </div>
  )
}
