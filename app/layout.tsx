import HeaderAuth from "@/app/(auth)/components/header-auth"
import { AppSidebar } from "@/app/components/sidebar/app-sidebar"
import { ThemeProvider } from "next-themes"
import { Geist } from "next/font/google"
import Link from "next/link"
import { Toaster } from "sonner"
import "./globals.css"

const defaultUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Fotion",
  description: "Fotion, your focus zone",
}

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
})

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <AppSidebar>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <main className="flex flex-col items-center w-full h-full">
              <div className="flex-1 w-full flex flex-col gap-1 items-center">
                <nav className="w-full flex justify-center h-16">
                  <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                    <div className="flex items-center font-semibold">
                      <Link href={"/"} className="flex items-center">
                        <img src="images/fotion-black.png" className="size-20 mr-2" />
                      </Link>
                    </div>
                    <div className="flex items-center gap-4">
                      <HeaderAuth />
                    </div>
                  </div>
                </nav>
                <div className="flex flex-col gap-20 max-w-5xl p-5 w-full h-full">{children}</div>
                <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
                  footer here
                </footer>
              </div>
            </main>
          </ThemeProvider>
          <Toaster />
        </AppSidebar>
      </body>
    </html>
  )
}
