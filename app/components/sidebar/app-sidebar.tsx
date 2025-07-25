"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { DoubleArrowLeftIcon, DoubleArrowRightIcon, LockOpen1Icon } from "@radix-ui/react-icons"
import { Home, Target } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
    shortcut: "Cmd + Shift + H",
  },
  {
    title: "Focus",
    url: "focus",
    icon: Target,
    shortcut: "Cmd + Shift + F",
  },
  {
    title: "Logout",
    url: "logout",
    icon: LockOpen1Icon,
    shortcut: "Cmd + Shift + L",
  },
]

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 모든 단축키는 Cmd + Shift 조합에서만 동작합니다.
      const key = e.key.toLowerCase()

      // cmd+shift+f: focus 이동
      if (e.metaKey && e.shiftKey && key === "f") {
        e.preventDefault()
        router.push("/focus")
      }
      // cmd+shift+h: home 이동
      if (e.metaKey && e.shiftKey && key === "h") {
        e.preventDefault()
        router.push("/")
      }
      // cmd+shift+l: logout 이동
      if (e.metaKey && e.shiftKey && key === "l") {
        e.preventDefault()
        router.push("/logout")
      }
      // cmd+shift+s: sidebar 열고/닫기 토글
      if (e.metaKey && e.shiftKey && key === "s") {
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router])

  return (
    <SidebarProvider open={open}>
      <Sidebar collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem className={open ? "flex justify-end ml-auto" : "flex justify-start"}>
                  <SidebarMenuButton asChild onClick={() => setOpen(!open)}>
                    {open ? <DoubleArrowLeftIcon /> : <DoubleArrowRightIcon />}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title} className="group">
                    <SidebarMenuButton asChild>
                      <a href={item.url} className="flex items-center gap-2">
                        <item.icon />
                        <span>{item.title}</span>
                        {item.shortcut && (
                          <span className="ml-2 px-2 py-0.5 rounded bg-muted text-[10px] text-muted-foreground border hidden group-hover:inline">
                            {item.shortcut}
                          </span>
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      {children}
    </SidebarProvider>
  )
}
