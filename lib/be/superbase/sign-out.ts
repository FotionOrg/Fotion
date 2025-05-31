"use server"

import { createClient } from "@/lib/be/superbase/server"
import { redirect } from "next/navigation"

export const signOutAction = async () => {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect("/")
}
