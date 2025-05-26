import { getDomainUserOrNull } from "@/lib/be/utils/user"
import { redirect } from "next/navigation"
import { getLinearIntegration, getNotionIntegration, getProjects } from "./actions"
import FocusView from "./components/focus-view"

export default async function Page() {
  const user = await getDomainUserOrNull()
  if (!user) {
    return redirect("/")
  }

  const projects = await getProjects(user.id)
  const notionIntegration = await getNotionIntegration(user.id)
  const linearIntegration = await getLinearIntegration(user.id)

  return (
    <FocusView
      projects={projects}
      notionIntegrationId={notionIntegration?.id ?? null}
      linearIntegrationId={linearIntegration?.id ?? null}
      userId={user.id}
    />
  )
}
