import Link from 'next/link';
import { Film } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 mt-12 pb-20 lg:pb-8">
      <div className="max-w-[780px] mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Film className="w-5 h-5 text-blue-500" />
              <span className="font-bold text-gray-900 dark:text-white">FreeFileConvert</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Free online video tools. Compress videos and convert to MP3 instantly. No sign-up required.
            </p>
          </div>

          {/* Tools */}
          <div>
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">Tools</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/compress" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  Video Compressor
                </Link>
              </li>
              <li>
                <Link href="/convert-to-mp3" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  Video to MP3
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="text-xs text-gray-400">
            {new Date().getFullYear()} FreeFileConvert. All rights reserved. Files auto-deleted after 1 hour.
          </p>
        </div>
      </div>
    </footer>
  );
}
