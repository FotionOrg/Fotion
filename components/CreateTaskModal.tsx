'use client'

import { Task } from '@/types'
import { useState, useRef, useEffect } from 'react'
import { TASK_COLORS } from '@/lib/colors'
import { useTranslations } from 'next-intl'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export default function CreateTaskModal({ isOpen, onClose, onCreate }: CreateTaskModalProps) {
  const t = useTranslations()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [estimatedDuration, setEstimatedDuration] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [color, setColor] = useState('blue') // 기본 Color

  const modalRef = useRef<HTMLDivElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  const resetForm = () => {
    setTitle('')
    setContent('')
    setPriority('medium')
    setScheduledDate('')
    setScheduledTime('')
    setEstimatedDuration('')
    setTags([])
    setTagInput('')
    setColor('blue')
  }

  useEffect(() => {
    if (isOpen) {
      resetForm()
      // 모달 열릴 때 Title 입력에 포커스
      setTimeout(() => {
        titleInputRef.current?.focus()
      }, 100)
    }
    // resetForm은 useEffect 내에서만 호출되므로 의존성에 포함하지 않음
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      alert(t('task.enterTitle'))
      return
    }

    const newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: title.trim(),
      content: content.trim() || undefined,
      status: 'todo',
      priority,
      tags: tags.length > 0 ? tags : undefined,
      color,
      source: 'internal',
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      scheduledTime: scheduledTime || undefined,
      estimatedDuration: estimatedDuration ? parseInt(estimatedDuration) : undefined,
    }

    onCreate(newTask)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold">{t('task.createTask')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('task.title')} <span className="text-red-500">*</span>
            </label>
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('task.enterTitlePlaceholder')}
              className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              required
            />
          </div>

          {/* Description (향후 WYSIWYG 에디터로 교체) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('task.description')}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('task.enterContentPlaceholder')}
              className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px] resize-y"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
              💡 {t('task.editorUpgradeNote')}
            </p>
          </div>

          {/* Date/Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('task.date')} ({t('task.optional')})</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('task.time')} ({t('task.optional')})</label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 예상 소요 Time */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('task.estimatedDuration')} ({t('task.optional')})</label>
            <input
              type="number"
              min="1"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
              placeholder={t('task.estimatedDurationPlaceholder')}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {t('task.estimatedDurationNote')}
            </p>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('task.priority')}</label>
            <div className="flex gap-3">
              {[
                { value: 'low', label: t('task.low'), color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300' },
                { value: 'medium', label: t('task.medium'), color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' },
                { value: 'high', label: t('task.high'), color: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' },
              ].map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value as 'low' | 'medium' | 'high')}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                    priority === p.value
                      ? 'border-blue-500 ' + p.color
                      : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('task.blockColor')}</label>
            <div className="grid grid-cols-9 gap-2">
              {TASK_COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.name)}
                  className={`w-full aspect-square rounded-lg ${c.bg} transition-all hover:scale-110 ${
                    color === c.name
                      ? 'ring-4 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 ring-blue-500 scale-110'
                      : 'ring-1 ring-zinc-200 dark:ring-zinc-700'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
              {t('task.colorNote')}
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('task.tags')}</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder={t('task.enterTagsPlaceholder')}
                className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              >
                {t('common.add')}
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* 푸터 */}
        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors font-medium"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
