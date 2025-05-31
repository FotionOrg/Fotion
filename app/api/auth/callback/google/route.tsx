"use server"

import { prisma } from "@/app/pkg/prisma"
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/lib/be/superbase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/"
  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!data.user || !data.user.email) {
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }

    const user = await prisma.user.findUnique({
      where: {
        email: data.user.email,
      },
    })

    if (!user) {
      await prisma.user.create({
        data: {
          email: data.user.email,
          name: (data.user.user_metadata["full_name"] as string) ?? undefined,
        },
      })
    }

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host") // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development"
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
