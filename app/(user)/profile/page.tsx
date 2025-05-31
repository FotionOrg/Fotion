"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getCurrentUser } from "@/lib/fe/superbase/client"
import { deleteMyAccount } from "@/lib/fe/superbase/delete-my-account"
import { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser()

      if (!user) {
        router.push("/")
        return
      }

      setUser(user)
    }

    fetchUser()
  }, [router])

  const handleDeleteAccount = async () => {
    const isDeleted = await deleteMyAccount()
    if (isDeleted) {
      toast("Your account has been deleted!", {
        description: "Thank you for using Chirpify! See you next time 🙌",
      })
      setTimeout(() => {
        window.location.href = "/"
      }, 1000)
    } else {
      toast("Failed to delete account", {
        description: "Please try again later",
      })
    }
  }

  if (!user) return null

  return (
    <Card className="min-w-[50vw]">
      <CardHeader className="flex flex-col items-center">
        <Avatar className="mb-4 h-24 w-24">
          <AvatarImage src={user.user_metadata.avatar_url} />
          <AvatarFallback>{user.user_metadata.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <CardTitle>{user.user_metadata.name}</CardTitle>
      </CardHeader>
      <Separator className="mb-5" />
      <CardContent className="w-full">
        <Button variant="destructive" className="w-full" onClick={handleDeleteAccount}>
          회원 탈퇴
        </Button>
      </CardContent>
    </Card>
  )
}
