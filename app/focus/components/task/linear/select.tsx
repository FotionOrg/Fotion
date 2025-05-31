"use client"

import { getDatabasePagesSchema, getLinearIssuesSchema } from "@/app/api/notion/search/database/page/[projectId]/type"
import { taskSchema } from "@/app/api/task/type"
import { Input } from "@/components/ui/input"
import { Loader, Search } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { useDebouncedCallback } from "use-debounce"
import { z } from "zod"
import { getTaskOrCreateTask } from "../../project/api"

export default function LinearTaskSelect({
  projectId,
  selectedTask,
  setSelectedTask,
}: {
  projectId: string
  selectedTask: z.infer<typeof taskSchema> | null
  setSelectedTask: (task: z.infer<typeof taskSchema> | null) => void
}) {
  const [searchedVendorTasks, setSearchedVendorTasks] = useState<z.infer<typeof getDatabasePagesSchema>>([])
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
        setSearchedVendorTasks(data)
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
                  setSearchedVendorTasks([])
                } else {
                  debouncedTaskSearch(value)
                }
              }}
            />
          </div>
        )}
        <div className="bg-white rounded shadow overflow-auto min-h-0 ">
          {searchedVendorTasks.length > 0 &&
            selectedTask === null &&
            searchedVendorTasks.map((vendorTask) => (
              <div
                key={vendorTask.id}
                onClick={async () => {
                  const task = await getTaskOrCreateTask(vendorTask.id, projectId)
                  if (task) {
                    setSelectedTask(task)
                    setSearchedVendorTasks([])
                  } else {
                    toast.error("Failed to select task. Please try again.")
                  }
                }}
                className="hover:bg-primary/10 p-2 hover:cursor-pointer text-sm"
              >
                {vendorTask.title}
              </div>
            ))}
        </div>
      </div>

      {selectedTask && (
        <div className="relative w-full flex flex-col">
          <div className="flex items-center gap-2  rounded-lg text-sm justify-center">
            <div className="flex items-center gap-2">
              <div className="relative w-4 h-4">
                <Image src={"/images/linear.png"} fill alt="Notion Logo" className="object-contain" />
              </div>
              <div className="truncate max-w-xs">{selectedTask.vendorTaskId}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
