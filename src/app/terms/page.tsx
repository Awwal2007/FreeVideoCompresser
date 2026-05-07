import Link from 'next/link';

export const metadata = {
  title: "Terms of Service",
  description: "FreeFileConvert Terms of Service. Free online video tools. By using our service, you agree to these terms.",
};

export default function Terms() {
  return (
    <>
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">Terms of Service</span>
      </nav>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Terms of Service</h1>
      <div className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-400 leading-relaxed space-y-4">
        <p><strong>Last updated:</strong> May 6, 2024</p>
        <p>
          Welcome to FreeFileConvert. By accessing or using our website and services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
        </p>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">Use of Service</h2>
        <p>
          FreeFileConvert provides free online video compression and audio extraction tools. You may use our services for personal, non-commercial, and commercial purposes provided you comply with these terms.
        </p>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">Prohibited Uses</h2>
        <p>You agree not to use our service to:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Upload or process illegal, infringing, or harmful content</li>
          <li>Violate any applicable laws or regulations</li>
          <li>Upload files containing malware, viruses, or malicious code</li>
          <li>Attempt to gain unauthorized access to our servers or infrastructure</li>
          <li>Automate access or abuse our rate limits</li>
        </ul>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">File Retention</h2>
        <p>
          All uploaded and processed files are automatically deleted after 1 hour. We are not responsible for files that are lost due to delayed downloads or technical issues.
        </p>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">Disclaimer</h2>
        <p>
          Our services are provided "as is" without warranties of any kind. We do not guarantee that our tools will work with every file format or that output quality will meet your expectations.
        </p>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">Limitation of Liability</h2>
        <p>
          FreeFileConvert shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services.
        </p>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">Changes</h2>
        <p>
          We may update these terms at any time. Continued use of the service after changes constitutes acceptance of the revised terms.
        </p>
      </div>
    </>
  );
}
