import HeaderAuth from "@/app/(auth)/components/header-auth";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";
import { Toaster } from 'sonner';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Chirpify",
  description: "Chirpify, Learn English by Thinking",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 w-full flex flex-col gap-1 items-center">
              <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                  <div className="flex items-center font-semibold">
                    <Link href={"/"} className="flex items-center">
                      <img src="images/icon.png" alt="Icon" className="w-12 h-12 mr-2" />
                      <span className="text-2xl font-bold">Chirpify</span>
                    </Link>
                    <div className="flex items-center"></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <HeaderAuth />
                  </div>
                </div>
              </nav>
              <div className="flex flex-col gap-20 max-w-5xl p-5">
                {children}
              </div>
              <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
                footer TBD
              </footer>
            </div>
          </main>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
