import Link from 'next/link';
import { Mail, MessageSquare, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: "Contact Us",
  description: "Contact FreeFileConvert for support, feedback, or inquiries about our free video compressor and MP3 converter tools.",
};

export default function Contact() {
  return (
    <>
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">Contact</span>
      </nav>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h1>
      <div className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-400 leading-relaxed space-y-6">
        <p>
          Have questions, feedback, or need help with our video tools? We would love to hear from you.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Mail size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Email</h2>
            </div>
            <p className="text-sm">For general inquiries and support:</p>
            <a href="mailto:support@freefileconvert.com" className="text-blue-600 hover:underline font-medium">
              support@freefileconvert.com
            </a>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <MessageSquare size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Feedback</h2>
            </div>
            <p className="text-sm">Have a feature request or found a bug?</p>
            <a href="mailto:feedback@freefileconvert.com" className="text-purple-600 hover:underline font-medium">
              feedback@freefileconvert.com
            </a>
          </div>
        </div>

        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-900">
          <p className="text-sm text-yellow-800 dark:text-yellow-400">
            <strong>Note:</strong> We do not provide phone support. For fastest response, please email us with details about your issue.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </div>
    </>
  );
}
