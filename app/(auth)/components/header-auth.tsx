import { UserProfile } from "@/app/(user)/components/user_profile_avatar"
import { createClient } from "@/lib/be/superbase/server"
import Link from "next/link"
import { Button } from "../../../components/ui/button"

export default async function AuthButton() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user ? (
    <div className="flex items-center gap-4">
      <UserProfile />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"default"}>
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  )
}
