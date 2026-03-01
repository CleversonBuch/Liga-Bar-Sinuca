import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar"
import { isAdmin, isSuperAdmin as getIsSuperAdmin } from "@/lib/auth"
import { logoutAdmin } from "@/app/actions"
import { getAppSettings } from "@/app/settings/actions"
import { Toaster } from "@/components/ui/sonner"
import { MobileHeader } from "@/components/MobileHeader"
import { MobileNav } from "@/components/MobileNav"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Liga Sinuca - Tournaments & Rankings",
  description: "Professional billiard tournament and ranking management system.",
};

export const viewport: Viewport = {
  themeColor: "#09090b", // zinc-950
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isOperator = await isAdmin()
  const isSuperAdmin = await getIsSuperAdmin()
  const appSettings = await getAppSettings()

  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex h-screen overflow-hidden bg-background text-foreground font-sans`}
      >
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 inset-x-0 h-[600px] w-full bg-gradient-to-b from-primary/10 via-background/0 to-background/0 pointer-events-none -z-10 blur-3xl opacity-50"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10 opacity-30"></div>

        <Sidebar
          isOperator={isOperator}
          performLogoutAction={logoutAdmin}
          appSettings={appSettings}
          isSuperAdmin={isSuperAdmin}
        />

        <div className="flex-1 flex flex-col h-screen w-full relative overflow-hidden">
          <MobileHeader
            isOperator={isOperator}
            performLogoutAction={logoutAdmin}
            appSettings={appSettings}
            isSuperAdmin={isSuperAdmin}
          />

          <main className="flex-1 w-full overflow-y-auto pb-32 md:pb-10 scrollbar-hide">
            <div className="max-w-screen-2xl mx-auto">
              {children}
            </div>
          </main>

          <MobileNav />
        </div>

        <Toaster theme="dark" position="top-right" richColors closeButton className="font-sans" />
      </body>
    </html>
  );
}
