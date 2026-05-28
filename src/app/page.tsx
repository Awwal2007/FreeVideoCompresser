import Link from 'next/link';
import { 
  ArrowRight, Shield, Zap, Lock, Droplets, Upload, 
  Settings, Download, Sparkles, FileImage, FileText, Smartphone 
} from 'lucide-react';
import { JsonLd, schemas } from '@/components/JsonLd';

export const metadata = {
  title: "Free Video Compressor, Background Remover & PDF Tools Online | FreeFileConvert",
  description: "FreeFileConvert offers free online tools to compress video/images, remove backgrounds using AI, compress and merge PDFs, resize videos for TikTok, and download media. No sign-up required.",
};

export default function Home() {
  const siteUrl = 'https://freefileconvert.com';

  const tools = [
    {
      name: 'Compress Video',
      path: '/compress',
      desc: 'Reduce video file size online free. Choose your compression level and get a smaller file without major quality loss.',
      icon: Settings,
      color: 'from-blue-50 to-white dark:from-blue-950/30 dark:to-gray-900 border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400',
      badges: ['MP4', 'WEBM', 'Up to 500MB']
    },
    {
      name: 'Convert to MP3',
      path: '/convert-to-mp3',
      desc: 'Convert video to MP3 online free. Extract high-quality audio from any video file in seconds with custom bitrates.',
      icon: Zap,
      color: 'from-purple-50 to-white dark:from-purple-950/30 dark:to-gray-900 border-purple-100 dark:border-purple-900 text-purple-600 dark:text-purple-400',
      badges: ['MP3', '128-320kbps', 'Any Video']
    },
    {
      name: 'Remove Background',
      path: '/remove-background',
      desc: 'AI-powered automatic subject detection for images and videos. Replace background with transparent, solids, or uploads.',
      icon: Sparkles,
      color: 'from-pink-50 to-white dark:from-pink-950/30 dark:to-gray-900 border-pink-100 dark:border-pink-900 text-pink-600 dark:text-pink-400',
      badges: ['AI-Powered', 'Image & Video', 'Edge Control']
    },
    {
      name: 'Compress Image',
      path: '/compress-image',
      desc: 'Compress and resize JPG, PNG, WebP, GIF, SVG files. Adjust quality slider, preview before/after savings, keep EXIF.',
      icon: FileImage,
      color: 'from-green-50 to-white dark:from-green-950/30 dark:to-gray-900 border-green-100 dark:border-green-900 text-green-600 dark:text-green-400',
      badges: ['Quality Slider', 'Resize', 'Batch (Up to 20)']
    },
    {
      name: 'PDF Tools',
      path: '/compress-pdf',
      desc: 'Compress and merge PDF files online. Adjust image DPI, subset fonts, and optimize multiple PDFs with encryption support.',
      icon: FileText,
      color: 'from-red-50 to-white dark:from-red-950/30 dark:to-gray-900 border-red-100 dark:border-red-900 text-red-600 dark:text-red-400',
      badges: ['Compress', 'Merge PDFs', 'Password Support']
    },
    {
      name: 'TikTok Video Resizer',
      path: '/resize-tiktok',
      desc: 'Convert landscape videos to 9:16 vertical TikTok layout. Add blurred backgrounds, safe-zone overlays, and subtitles.',
      icon: Smartphone,
      color: 'from-indigo-50 to-white dark:from-indigo-950/30 dark:to-gray-900 border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400',
      badges: ['9:16 Vertical', 'Blur / Fill', 'Subtitles']
    },
    {
      name: 'Video Downloader',
      path: '/downloader',
      desc: 'Download videos and audio from YouTube, TikTok, Instagram, and more. Select up to 4K quality with no watermarks.',
      icon: Download,
      color: 'from-orange-50 to-white dark:from-orange-950/30 dark:to-gray-900 border-orange-100 dark:border-orange-900 text-orange-600 dark:text-orange-400',
      badges: ['No Watermark', 'HD / 4K', 'Audio Extract']
    }
  ];

  const faqs = [
    {
      question: 'Is FreeFileConvert really free?',
      answer: 'Yes, FreeFileConvert is completely free to use. No registration, no subscription, and no hidden fees. We support our service through advertisements.'
    },
    {
      question: 'What video and image formats are supported?',
      answer: 'We support all major video formats (MP4, MOV, AVI, MKV, WEBM) and image formats (JPG, PNG, WebP, GIF, SVG). You can compress or convert files up to 500MB.'
    },
    {
      question: 'How long are my files stored?',
      answer: 'For your privacy and security, all uploaded and processed files are automatically deleted from our servers after 1 hour. We never keep copies of your files.'
    },
    {
      question: 'How does AI background removal work?',
      answer: 'Our Remove Background tool uses client-side AI processing (WebGL accelerated) to detect subjects in images or videos directly in your browser. This guarantees extreme processing speed and keeps your media 100% private.'
    },
    {
      question: 'Can I download videos without watermarks?',
      answer: 'Yes! The Universal Video Downloader fetches the source video stream directly from platforms like TikTok and Instagram, ensuring you get water-free, crystal-clear downloads.'
    },
    {
      question: 'Is there a limit to batch processing?',
      answer: 'You can upload and compress up to 20 images at the same time. The PDF tool also supports merging multiple files in a single pass.'
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
          All-in-One Online Media & <br className="hidden sm:block" />
          <span className="text-blue-600">File Converters</span>
        </h1>
        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Free Online File Processors — No Sign-Up Required
        </p>
        <p className="mt-2 text-sm text-gray-400">
          Compress videos, resize TikTok clips, remove backgrounds using AI, optimize images & PDFs, or download media instantly.
        </p>
      </section>

      {/* Feature Grid */}
      <section className="py-4 w-full">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Choose a Tool
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 w-full">
          {tools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <Link
                key={tool.path}
                href={tool.path}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${tool.color} border p-6 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-sm">
                      <IconComponent size={28} />
                    </div>
                    <div className="p-2 rounded-full bg-gray-50 dark:bg-gray-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                      <ArrowRight size={18} className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                    {tool.desc}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-gray-100 dark:border-gray-800/50">
                  {tool.badges.map((badge) => (
                    <span 
                      key={badge} 
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/70 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 border border-gray-150 dark:border-gray-700/30"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 w-full">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Simple 3-Step Workflow
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: Upload,
              title: '1. Import Files',
              desc: 'Select or drag your videos, images, or PDFs into our secure web uploader. Batch uploads are supported.',
            },
            {
              icon: Settings,
              title: '2. Adjust Settings',
              desc: 'Select target formats, AI parameters, background colors, or compression sliders to match your needs.',
            },
            {
              icon: Download,
              title: '3. Instant Download',
              desc: 'Process files securely. Download individual output formats, subtitles, or batch files zipped in a click.',
            }
          ].map((step, idx) => (
            <div key={step.title} className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800/40">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mb-4 border border-blue-100/50 dark:border-blue-900/50">
                <step.icon size={22} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose FreeFileConvert */}
      <section className="py-6 w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Droplets, label: 'Free Forever', desc: 'Unlimited conversions' },
            { icon: Zap, label: 'Fast Processors', desc: 'Server & GPU accelerated' },
            { icon: Lock, label: '100% Private', desc: 'Auto-delete after 1h' },
            { icon: Shield, label: 'No Watermarks', desc: 'Clean source outputs' }
          ].map((feat) => (
            <div key={feat.label} className="text-center p-4 rounded-xl border border-gray-100 dark:border-gray-800/60 bg-white dark:bg-gray-900/20">
              <feat.icon size={24} className="mx-auto mb-2 text-blue-500 dark:text-blue-400" />
              <h4 className="text-xs font-semibold text-gray-900 dark:text-white">{feat.label}</h4>
              <p className="text-[10px] text-gray-500 mt-1">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 w-full">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4 max-w-3xl mx-auto">
          {faqs.map((faq, idx) => (
            <details
              key={idx}
              className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden"
            >
              <summary className="flex items-center justify-between cursor-pointer p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white pr-4">{faq.question}</h3>
                <span className="shrink-0 text-gray-400 group-open:rotate-180 transition-transform">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </summary>
              <div className="px-4 pb-4 text-xs text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-50 dark:border-gray-900/50 pt-3">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
