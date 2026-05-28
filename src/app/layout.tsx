import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import AdBanner from "@/components/AdBanner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://freevidtools.com'),
  title: {
    default: "FreeVidTools | Video Compressor & MP3 Converter",
    template: "%s | FreeVidTools",
  },
  description: "Free Online Video Compressor & MP3 Converter — No Sign-Up Required. Reduce video file size or extract audio instantly.",
  keywords: [
    "free video compressor",
    "video to mp3",
    "online video converter",
    "reduce video size online free",
    "compress mp4 online",
    "extract audio from video",
    "free online converter"
  ],
  creator: "FreeFileConvert",
  publisher: "FreeFileConvert",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "FreeVidTools | Video Compressor & MP3 Converter",
    description: "Free Online Video Compressor & MP3 Converter — No Sign-Up Required. Reduce video file size or extract audio instantly.",
    url: process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://freevidtools.com',
    siteName: "FreeVidTools",
    locale: "en_US",
    type: "website",
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'FreeVidTools - Video Tools' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Video Compressor & MP3 Converter Online',
    description: 'Reduce video file size or extract audio in seconds. Free, secure, and no sign-up required.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://freefileconvert.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
            <script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
              crossOrigin="anonymous"
            />
          )}
          <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Navbar />
            <div className="max-w-[1200px] mx-auto w-full flex justify-center flex-1">
              {/* Left Ad Sidebar - Hidden on mobile */}
              <aside className="hidden lg:flex flex-col items-center w-[160px] shrink-0 pt-6 px-2">
                <AdBanner slot="left-skyscraper" format="skyscraper" />
              </aside>

              {/* Center Content Column */}
              <main className="w-full max-w-[780px] min-w-0 px-4 sm:px-6 py-6 flex flex-col items-center">
                <AdBanner slot="top-leaderboard" format="leaderboard" className="mb-8" />
                <div className="w-full">
                  {children}
                </div>
                <AdBanner slot="bottom-leaderboard" format="leaderboard" className="mt-8" />
              </main>

              {/* Right Ad Sidebar - Hidden on mobile */}
              <aside className="hidden lg:flex flex-col items-center w-[160px] shrink-0 pt-6 px-2">
                <AdBanner slot="right-skyscraper" format="skyscraper" />
              </aside>
            </div>
            <Footer />
            <Toaster position="top-center" />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
