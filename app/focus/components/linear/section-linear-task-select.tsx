"use client"

import { Input } from "@/components/ui/input"
import { Loader, Search } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import { z } from "zod"
import {
  getDatabasePagesSchema,
  getLinearIssuesSchema,
  linearIssueSchema
} from "../../../api/notion/search/database/page/[projectId]/type"

export default function LinearTaskSelect({
  selectedTask,
  setSelectedTask,
}: {
  selectedTask: z.infer<typeof linearIssueSchema> | null
  setSelectedTask: (task: z.infer<typeof linearIssueSchema> | null) => void
}) {
  const [searchedTasks, setSearchedTasks] = useState<
    z.infer<typeof getDatabasePagesSchema>
  >([])
  const [isSearching, setIsSearching] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  function searchTasks(query: string) {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setIsSearching(true)

    const url = `/api/linear/search/issues?title=${encodeURIComponent(query)}`
    fetch(url, {
      method: "GET",
      signal: abortControllerRef.current.signal,
    })
      .then(async (res) => getLinearIssuesSchema.parse(await res.json()))
      .then((data) => {
        console.log(data)
        setSearchedTasks(data)
        setIsSearching(false)
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error(err)
          setIsSearching(false)
        }
      })
  }

  const debouncedTaskSearch = useDebouncedCallback((value) => {
    searchTasks(value)
  }, 200)

  // 컴포넌트가 언마운트될 때 진행 중인 요청 취소
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return (
    <div>
      <div className="w-full border-none">
        {selectedTask === null && (
          <div className="flex items-center border-b px-3">
            ,
            {isSearching ? (
              <Loader className="mr-2 h-4 w-4 shrink-0 opacity-50 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            )}
            <Input
              placeholder="Search tasks..."
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-none focus:outline-none focus:border-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              onChange={(e) => {
                const value = e.target.value
                if (value === "") {
                  setSearchedTasks([])
                } else {
                  debouncedTaskSearch(value)
                }
              }}
            />
          </div>
        )}
        <div className="bg-white rounded shadow overflow-auto min-h-0 ">
          {searchedTasks.length > 0 &&
            selectedTask === null &&
            searchedTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => {
                  setSelectedTask(task)
                  setSearchedTasks([])
                }}
                className="hover:bg-primary/10 p-2 hover:cursor-pointer text-sm"
              >
                {task.title}
              </div>
            ))}
        </div>
      </div>

      {selectedTask && (
        <div className="relative w-full flex flex-col">
          <div className="flex items-center gap-2  rounded-lg text-sm justify-center">
            <div className="flex items-center gap-2">
              <div className="relative w-4 h-4">
                <Image
                  src={"/images/linear.png"}
                  fill
                  alt="Notion Logo"
                  className="object-contain"
                />
              </div>
              <div className="truncate max-w-xs">
                {selectedTask.title}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}