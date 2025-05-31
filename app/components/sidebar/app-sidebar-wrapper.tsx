import { AppSidebar } from "@/app/components/sidebar/app-sidebar"
import { getCurrentUser } from "@/lib/be/superbase/server"

export async function AppSidebarWrapper({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) {
    return null
  }

  return <AppSidebar>{children}</AppSidebar>
}
