import { taskSchema } from "@/app/api/task/type"
import { z } from "zod"

export async function getTaskOrCreateTask(
  vendorTaskId: string,
  projectId: string,
): Promise<z.infer<typeof taskSchema> | null> {
  const res = await fetch("/api/task", {
    method: "POST",
    body: JSON.stringify({
      vendorTaskId: vendorTaskId,
      projectId,
      duration: [
        {
          type: "BREAK",
          duration: 0,
        },
      ],
    }),
  }).catch((err) => {
    console.error(err)
    return null
  })
  if (!res || !res.ok) {
    return null
  }

  const json = await res.json()
  const data = taskSchema.parse(json)
  return data
}
