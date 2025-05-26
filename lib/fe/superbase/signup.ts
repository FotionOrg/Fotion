"use client";
import { createClient } from "@/lib/fe/superbase/client";

export async function signUpWithGoogle() {
  const supabase = await createClient();


  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_DOMAIN}/api/auth/callback/google`,
    },
  });

  if (error) {
    throw error;
  }

  return data;
}
