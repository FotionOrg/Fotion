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
import { useEffect, useState } from "react"

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Focus",
    url: "focus",
    icon: Target,
  },
  {
    title: "Logout",
    url: "logout",
    icon: LockOpen1Icon,
  },
]

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-open")
    setOpen(saved === "true")
  }, [])

  useEffect(() => {
    localStorage.setItem("sidebar-open", String(open))
  }, [open])

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
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
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
