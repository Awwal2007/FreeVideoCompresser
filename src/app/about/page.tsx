import Link from 'next/link';

export const metadata = {
  title: "About FreeFileConvert",
  description: "Learn about FreeFileConvert, a free online video compressor and MP3 converter. No sign-up required. Fast, secure, and private.",
};

export default function About() {
  return (
    <>
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">About</span>
      </nav>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About FreeFileConvert</h1>
      <div className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-400 leading-relaxed space-y-4">
        <p>
          FreeFileConvert is a free online media conversion platform built to make video processing simple, fast, and accessible to everyone. 
          Our mission is to provide powerful video compression and audio extraction tools without requiring sign-ups, subscriptions, or software installations.
        </p>
        <p>
          We use FFmpeg, the world’s leading multimedia framework, running on secure servers to process your files. 
          All uploads are automatically deleted after 1 hour, ensuring your privacy and data security.
        </p>
        <p>
          Whether you need to reduce a video file size for email sharing, optimize a video for web upload, or extract the soundtrack from a video clip, 
          FreeFileConvert handles it instantly in your browser.
        </p>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">Our Tools</h2>
        <ul className="list-disc list-inside space-y-1">
          <li><Link href="/compress" className="text-blue-600 hover:underline">Video Compressor</Link> — Reduce MP4, MOV, AVI, MKV, WEBM file sizes</li>
          <li><Link href="/convert-to-mp3" className="text-blue-600 hover:underline">Video to MP3 Converter</Link> — Extract audio at 128, 192, or 320kbps</li>
        </ul>
      </div>
    </>
  );
}
