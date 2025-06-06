"use server"

import { env } from "@/lib/be/utils/env"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const createClient = async () => {
  const cookieStore = await cookies()

  return createServerClient(env.nextPublicSupabaseUrl, env.nextPublicSupabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch (_) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

export const getCurrentUser = async () => {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error) {
    return null
  }
  return data.user
}
