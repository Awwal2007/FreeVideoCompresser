import Link from 'next/link';
import { ArrowRight, Shield, Zap, Lock, Droplets, Upload, Settings, Download } from 'lucide-react';
import { JsonLd, schemas } from '@/components/JsonLd';

export const metadata = {
  title: "Free Video Compressor & MP3 Converter Online",
  description: "FreeFileConvert offers free online video compression and video to MP3 conversion. No sign-up required. Supports MP4, MOV, AVI, MKV, WEBM. Up to 500MB files.",
};

export default function Home() {
  const siteUrl = 'https://freefileconvert.com';

  const faqs = [
    {
      question: 'Is FreeFileConvert really free?',
      answer: 'Yes, FreeFileConvert is completely free to use. No registration, no subscription, and no hidden fees. We support our service through advertisements.'
    },
    {
      question: 'What video formats are supported?',
      answer: 'We support all major video formats including MP4, MOV, AVI, MKV, WEBM, and M4V. You can upload files up to 500MB in size.'
    },
    {
      question: 'How long are my files stored?',
      answer: 'For your privacy and security, all uploaded and processed files are automatically deleted from our servers after 1 hour. We never keep copies of your files.'
    },
    {
      question: 'Is there a watermark on compressed videos?',
      answer: 'No, we never add watermarks to your videos. The compressed file will be clean and ready to use anywhere.'
    },
    {
      question: 'What is CRF and how does compression work?',
      answer: 'CRF (Constant Rate Factor) controls the quality vs file size tradeoff. Lower CRF means better quality but larger file. We offer Low (CRF 28), Medium (CRF 32), and High (CRF 38) compression levels.'
    },
    {
      question: 'What MP3 quality should I choose?',
      answer: '128kbps is standard quality suitable for speech, 192kbps offers excellent balance for music, and 320kbps provides near-lossless audio perfect for audiophiles.'
    }
  ];

  return (
    <>
      <JsonLd data={[
        schemas.website(siteUrl),
        schemas.faqPage(faqs),
        schemas.breadcrumbs([
          { name: 'Home', url: siteUrl }
        ])
      ]} />

      {/* Hero Section */}
      <section className="text-center py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
          Free Video Compressor & <br className="hidden sm:block" />
          <span className="text-blue-600">MP3 Converter</span>
        </h1>
        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Free Online Video Compressor & MP3 Converter — No Sign-Up Required
        </p>
        <p className="mt-2 text-sm text-gray-400">
          Reduce video file size without losing quality. Extract audio from any video instantly.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/compress"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Settings size={20} />
            Compress Video
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/convert-to-mp3"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Zap size={20} />
            Convert to MP3
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Compress Video Card */}
          <Link
            href="/compress"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-gray-900 border border-blue-100 dark:border-blue-900 p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                <Settings size={28} className="text-blue-600 dark:text-blue-400" />
              </div>
              <ArrowRight size={20} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Compress Video
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Reduce video file size online free. Choose your compression level and get a smaller file without major quality loss.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full">MP4</span>
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full">WEBM</span>
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full">Up to 500MB</span>
            </div>
          </Link>

          {/* Convert to MP3 Card */}
          <Link
            href="/convert-to-mp3"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/30 dark:to-gray-900 border border-purple-100 dark:border-purple-900 p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                <Zap size={28} className="text-purple-600 dark:text-purple-400" />
              </div>
              <ArrowRight size={20} className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Convert to MP3
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Convert video to MP3 online free. Extract high-quality audio from any video in seconds. Choose 128kbps, 192kbps, or 320kbps.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full">MP3</span>
              <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full">128-320kbps</span>
              <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full">Any Video</span>
            </div>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-10">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
          How It Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: Upload,
              title: '1. Upload',
              desc: 'Drag and drop your video or click to select. We support MP4, MOV, AVI, MKV, and WEBM formats.',
              color: 'blue'
            },
            {
              icon: Settings,
              title: '2. Process',
              desc: 'Choose your settings — compression level or audio quality. Our servers handle everything securely.',
              color: 'purple'
            },
            {
              icon: Download,
              title: '3. Download',
              desc: 'Get your processed file instantly. No waiting, no watermarks. Files auto-delete after 1 hour.',
              color: 'green'
            }
          ].map((step) => (
            <div key={step.title} className="text-center p-5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                <step.icon size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-10">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Why Choose FreeFileConvert?
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Droplets, label: 'Free Forever', desc: 'No fees, ever' },
            { icon: Zap, label: 'Fast Processing', desc: 'Server-side FFmpeg' },
            { icon: Lock, label: 'Secure & Private', desc: 'Auto-delete in 1h' },
            { icon: Shield, label: 'No Watermark', desc: 'Clean output files' }
          ].map((feat) => (
            <div key={feat.label} className="text-center p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              <feat.icon size={24} className="mx-auto mb-2 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{feat.label}</h3>
              <p className="text-xs text-gray-500 mt-1">{feat.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <p className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
            <Shield size={16} />
            No file size limit — process files up to 500MB
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-10">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <details
              key={idx}
              className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
            >
              <summary className="flex items-center justify-between cursor-pointer p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <h3 className="font-medium text-gray-900 dark:text-white pr-4">{faq.question}</h3>
                <span className="shrink-0 text-gray-400 group-open:rotate-180 transition-transform">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
