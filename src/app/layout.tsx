import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://freefileconvert.com'),
  title: {
    default: "Free Video Compressor & MP3 Converter Online | FreeFileConvert",
    template: "%s | FreeFileConvert",
  },
  description: "Free Online Video Compressor & MP3 Converter — No Sign-Up Required. Reduce video file size without losing quality (MP4, MOV, AVI, MKV, WEBM). Extract high-quality audio from any video instantly.",
  keywords: [
    "free video compressor", 
    "video to mp3", 
    "online video converter", 
    "reduce video size online free", 
    "compress mp4 online", 
    "extract audio from video", 
    "free online converter"
  ],
  authors: [{ name: "FreeFileConvert" }],
  creator: "FreeFileConvert",
  publisher: "FreeFileConvert",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Free Video Compressor & MP3 Converter Online",
    description: "Free Online Video Compressor & MP3 Converter — No Sign-Up Required. Reduce video file size or extract audio in seconds.",
    url: "https://freefileconvert.com",
    siteName: "FreeFileConvert",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: '/og-image.png', // You should create this image
        width: 1200,
        height: 630,
        alt: 'FreeFileConvert - Video Tools',
      },
    ],
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
            <Script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
              crossOrigin="anonymous"
              strategy="afterInteractive"
            />
          )}
          <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Navbar />
            <div className="max-w-[1200px] mx-auto w-full flex justify-center flex-1">
              {/* Left Ad Sidebar - Hidden on mobile */}
              <aside className="hidden lg:flex flex-col items-center w-[160px] shrink-0 pt-6 px-2">
                <div className="w-full h-[600px] bg-muted/50 rounded flex items-center justify-center text-xs text-muted-foreground text-center p-4 border border-dashed border-muted">
                  Skyscraper Ad
                </div>
              </aside>

              {/* Center Content Column */}
              <main className="w-full max-w-[780px] min-w-0 px-4 sm:px-6 py-6">
                {children}
              </main>

              {/* Right Ad Sidebar - Hidden on mobile */}
              <aside className="hidden lg:flex flex-col items-center w-[160px] shrink-0 pt-6 px-2">
                <div className="w-full h-[600px] bg-muted/50 rounded flex items-center justify-center text-xs text-muted-foreground text-center p-4 border border-dashed border-muted">
                  Skyscraper Ad
                </div>
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
