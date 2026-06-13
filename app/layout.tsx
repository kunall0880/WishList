import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/auth-provider";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import DebugInputWatcher from "@/components/DebugInputWatcher";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["500", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wishlist AI — Turn Your Dreams Into an Investment Plan",
  description:
    "AI-powered goal-based financial planning for Indian investors. Enter a life goal in under 60 seconds and get a complete, confidence-inspiring investment roadmap with SIP calculations, risk profiling, and portfolio recommendations.",
  keywords: [
    "financial planning",
    "SIP calculator",
    "goal-based investing",
    "AI financial advisor",
    "Indian mutual funds",
    "investment planner",
  ],
  authors: [{ name: "Wishlist AI" }],
  openGraph: {
    title: "Wishlist AI — Turn Your Dreams Into an Investment Plan",
    description:
      "Tell us your goal. We'll calculate the exact SIP, timeline, and investment strategy to get you there.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${inter.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <SessionProvider>
            <AuthProvider>
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-brand-primary focus:px-4 focus:py-2 focus:text-white"
              >
                Skip to main content
              </a>
              {children}
            </AuthProvider>
          </SessionProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "rgb(var(--color-surface-700))",
                color: "rgb(var(--color-text-primary))",
                borderRadius: "12px",
                border: "1px solid rgba(108, 99, 255, 0.2)",
                fontSize: "14px",
              },
              success: {
                iconTheme: {
                  primary: "#06D6A0",
                  secondary: "white",
                },
              },
              error: {
                iconTheme: {
                  primary: "#FF6B6B",
                  secondary: "white",
                },
              },
            }}
          />
          {/* {process.env.NODE_ENV === "development" && <DebugInputWatcher />} */}
        </ThemeProvider>
      </body>
    </html>
  );
}
