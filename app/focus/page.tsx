import { getDomainUserOrNull } from "@/lib/be/utils/user"
import { redirect } from "next/navigation"
import { getLinearIntegration, getNotionIntegration, getProjects } from "./actions"
import FocusView from "./components/focus-view"

export default async function Page() {
  const user = await getDomainUserOrNull()
  if (!user) {
    return redirect("/")
  }

  const projects = await getProjects("1a201e45-025c-460e-a14b-166c98f6ed51")
  const notionIntegration = await getNotionIntegration("1a201e45-025c-460e-a14b-166c98f6ed51")
  const linearIntegration = await getLinearIntegration("1a201e45-025c-460e-a14b-166c98f6ed51")

  return (
    <FocusView
      projects={projects}
      notionIntegrationId={notionIntegration?.id ?? null}
      linearIntegrationId={linearIntegration?.id ?? null}
      userId={user.id}
    />
  )
}
