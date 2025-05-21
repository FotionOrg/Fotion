import { getDomainUserOrNull } from "@/lib/be/utils/user"
import { redirect } from "next/navigation"
import { getNotionIntegration, getProjects } from "./actions"
import FocusView from "./components/focus-view"

export default async function Page() {
  const user = await getDomainUserOrNull()
  if (!user) {
    return redirect("/")
  }

  const projects = await getProjects(user.id)
  const notionIntegration = await getNotionIntegration(user.id)

  return (
    <FocusView
      projects={projects}
      notionIntegrationId={notionIntegration?.id ?? null}
      userId={user.id}
    />
  )
}
