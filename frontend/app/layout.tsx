import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "ProctorAI — AI-Powered Online Examination Platform",
  description: "ProctorAI is a secure AI-powered online examination platform featuring intelligent proctoring, automated evaluation, and comprehensive exam management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} dark`}>
      <body className="antialiased bg-background text-foreground min-h-screen">
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

