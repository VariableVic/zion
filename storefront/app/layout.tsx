import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Mona_Sans as FontSans } from "next/font/google";
import localFont from "next/font/local";
import type React from "react";
import "./globals.css";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontHeading = localFont({
  src: "../assets/fonts/CalSans-Regular.woff2",
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "Zion",
  description:
    "An AI-powered shopping assistant for a modern e-commerce experience",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
  drawer,
}: Readonly<{
  children: React.ReactNode;
  drawer?: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen max-h-screen bg-background font-sans antialiased overflow-hidden hide-scrollbar",
          fontSans.variable,
          fontHeading.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <div id="sidebar-portal" />
          {drawer}
        </ThemeProvider>
      </body>
    </html>
  );
}

import "./globals.css";
