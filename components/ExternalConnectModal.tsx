'use client'

import { useState } from 'react'

interface ExternalConnectModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (services: string[]) => void
}

type Service = 'notion' | 'linear' | 'google-calendar'

const services: Array<{
  id: Service
  name: string
  icon: string
  description: string
  color: string
}> = [
  {
    id: 'notion',
    name: 'Notion',
    icon: '📋',
    description: '노션 페이지와 데이터베이스를 동기화',
    color: 'bg-gray-100 dark:bg-gray-800',
  },
  {
    id: 'linear',
    name: 'Linear',
    icon: '🔵',
    description: 'Linear 이슈를 Task으로 가져오기',
    color: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    icon: '📅',
    description: '구글 캘린더 일정과 연동',
    color: 'bg-red-100 dark:bg-red-900/30',
  },
]

export default function ExternalConnectModal({
  isOpen,
  onClose,
  onConnect,
}: ExternalConnectModalProps) {
  const [selectedServices, setSelectedServices] = useState<Service[]>([])

  if (!isOpen) return null

  const toggleService = (serviceId: Service) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleConnect = () => {
    onConnect(selectedServices)
    setSelectedServices([])
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface w-full max-w-2xl rounded-xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                외부 서비스 연동
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                연동할 서비스를 선택하세요
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6 text-zinc-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 서비스 목록 */}
        <div className="p-6">
          <div className="grid gap-4">
            {services.map(service => {
              const isSelected = selectedServices.includes(service.id)
              return (
                <button
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-border hover:border-zinc-300 dark:hover:border-zinc-700 bg-surface'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* 아이콘 */}
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${service.color}`}
                    >
                      {service.icon}
                    </div>

                    {/* 정보 */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-foreground">
                          {service.name}
                        </h3>
                        {isSelected && (
                          <svg
                            className="w-5 h-5 text-primary-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* 안내 메시지 */}
          {selectedServices.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                💡 {selectedServices.length}개의 서비스가 선택되었습니다.
                연동하기 버튼을 클릭하여 Settings을 완료하세요.
              </p>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="p-6 border-t border-border flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConnect}
            disabled={selectedServices.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            연동하기 ({selectedServices.length})
          </button>
        </div>
      </div>
    </div>
  )
}
