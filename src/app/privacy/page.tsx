import Link from 'next/link';

export const metadata = {
  title: "Privacy Policy",
  description: "FreeFileConvert Privacy Policy. We never store your files longer than 1 hour. No personal data collection. Read how we protect your privacy.",
};

export default function Privacy() {
  return (
    <>
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">Privacy Policy</span>
      </nav>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
      <div className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-400 leading-relaxed space-y-4">
        <p><strong>Last updated:</strong> May 6, 2024</p>
        <p>
          At FreeFileConvert, your privacy is our priority. This Privacy Policy explains how we handle your data when you use our video compression and conversion tools.
        </p>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">File Processing</h2>
        <p>
          All files uploaded to FreeFileConvert are processed on our secure servers. <strong>Files are automatically deleted after 1 hour</strong> regardless of whether they were downloaded. We do not keep backups or copies of your uploaded or processed files.
        </p>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">Data Collection</h2>
        <p>
          We do not require user registration, and we do not collect personal information such as your name, email address, or phone number. We may collect non-identifiable technical data including:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>IP address (for rate limiting and abuse prevention)</li>
          <li>Browser type and version</li>
          <li>File format and size statistics (anonymized)</li>
        </ul>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">Cookies</h2>
        <p>
          We use minimal cookies for functionality purposes only. We do not use tracking cookies or share data with third-party advertisers beyond standard ad serving.
        </p>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">Third Parties</h2>
        <p>
          We use Google AdSense to display advertisements. Google may use cookies to serve ads based on your prior visits. You can opt out of personalized advertising by visiting Google’s Ads Settings.
        </p>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">Contact</h2>
        <p>
          If you have questions about this Privacy Policy, please <Link href="/contact" className="text-blue-600 hover:underline">contact us</Link>.
        </p>
      </div>
    </>
  );
}
