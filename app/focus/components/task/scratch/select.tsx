"use client"

import { taskSchema } from "@/app/api/task/type"
import Image from "next/image"
import { useEffect, useState } from "react"
import { z } from "zod"
import { getTaskOrCreateTask } from "../../project/api"

export default function ScratchTaskSelect({
  projectId,
  selectedTask,
  setSelectedTask,
}: {
  projectId: string
  selectedTask: z.infer<typeof taskSchema> | null
  setSelectedTask: (task: z.infer<typeof taskSchema> | null) => void
  isTimerRunning: boolean
  setIsTimerRunning: (isTimerRunning: boolean) => void
}) {
  const [selectedTaskTitle, setSelectedTaskTitle] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedTask) {
      getTaskOrCreateTask(projectId, projectId).then((task) => {
        if (task) {
          setSelectedTask(task)
          setSelectedTaskTitle(task.id)
        }
      })
    }
  }, [projectId, selectedTask, setSelectedTask])

  return (
    <div>
      <div className="bg-white rounded shadow overflow-auto min-h-0 ">
        {selectedTask && selectedTaskTitle && (
          <div className="relative w-full flex flex-col">
            <div className="flex items-center gap-2 rounded-lg text-sm justify-center">
              <div className="flex items-center gap-2">
                <div className="relative w-4 h-4">
                  <Image src={"/images/notion.png"} fill alt="Notion Logo" className="object-contain" />
                </div>
                {selectedTaskTitle}
                <button
                  className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded"
                  onClick={() => {
                    setSelectedTask(null)
                    setSelectedTaskTitle(null)
                  }}
                >
                  edit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
