import type { Metadata, Viewport } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

// --- Fonts ---
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

// --- Metadata ---
export const metadata: Metadata = {
  title: {
    default: "Crescendo — AI-Powered Music Intelligence",
    template: "%s | Crescendo",
  },
  description:
    "Predict tomorrow's music before the world hears it. AI-powered trend forecasting, viral prediction, and artist discovery platform.",
  keywords: [
    "music analytics",
    "AI music prediction",
    "viral songs",
    "music trends",
    "artist discovery",
    "music intelligence",
  ],
  authors: [{ name: "Crescendo Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://crescendo.ai",
    siteName: "Crescendo",
    title: "Crescendo — AI-Powered Music Intelligence",
    description: "Predict tomorrow's music before the world hears it.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crescendo — AI-Powered Music Intelligence",
    description: "Predict tomorrow's music before the world hears it.",
  },
};

export const viewport: Viewport = {
  themeColor: "#7c5cfc",
  width: "device-width",
  initialScale: 1,
};

// --- Root Layout ---
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-surface font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
