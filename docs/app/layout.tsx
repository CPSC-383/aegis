import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { lexend, geistMono } from "./fonts";
import "./globals.css";
import MobileNavigation from "@/components/MobileNavigation";

export const metadata: Metadata = {
  title: "Aegis",
  description: "Aegis Documentation for CPSC383",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${lexend.variable} ${geistMono.variable} h-screen overflow-hidden flex flex-col font-sans antialiased scroll-smooth`}
      >
        <ThemeProvider attribute="class" defaultTheme="light">
          <Navbar />
          <main className="flex-1 overflow-y-auto max-w-7xl w-full mx-auto flex flex-col items-center">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
