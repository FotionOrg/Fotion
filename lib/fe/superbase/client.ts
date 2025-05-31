"use client"

import { env } from "@/lib/be/utils/env"
import { createBrowserClient } from "@supabase/ssr"

export const createClient = () => createBrowserClient(env.nextPublicSupabaseUrl, env.nextPublicSupabaseAnonKey)

export const getCurrentUser = async () => {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error) {
    return null
  }
  return data.user
}
