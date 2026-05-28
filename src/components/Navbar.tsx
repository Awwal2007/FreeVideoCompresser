'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun, Film, ChevronDown, Video, Music, Sparkles, Image, FileText, Smartphone, Download } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'video' | 'image' | null>(null);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu and dropdowns on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  const videoTools = [
    { name: 'Compress Video', path: '/compress', icon: Video, desc: 'Reduce video size' },
    { name: 'Convert to MP3', path: '/convert-to-mp3', icon: Music, desc: 'Extract high-quality audio' },
    { name: 'TikTok Resizer', path: '/resize-tiktok', icon: Smartphone, desc: 'Fit to 9:16 layout' },
    { name: 'Video Downloader', path: '/downloader', icon: Download, desc: 'Download from YT, TikTok, IG' },
  ];

  const imagePdfTools = [
    { name: 'Remove Background', path: '/remove-background', icon: Sparkles, desc: 'AI bg removal' },
    { name: 'Compress Image', path: '/compress-image', icon: Image, desc: 'Optimize JPG, PNG, WebP' },
    { name: 'PDF Compressor', path: '/compress-pdf', icon: FileText, desc: 'Reduce PDF DPI and merge' },
  ];

  const allTools = [...videoTools, ...imagePdfTools];

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Film className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">
              FreeFileConvert
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname === '/'
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              Home
            </Link>

            {/* Video Tools Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('video')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  videoTools.some(t => t.path === pathname)
                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                Video Tools
                <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'video' ? 'rotate-180' : ''}`} />
              </button>

              {activeDropdown === 'video' && (
                <div className="absolute left-0 mt-0 w-64 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                  {videoTools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <Link
                        key={tool.path}
                        href={tool.path}
                        className={`flex items-start gap-3 p-2 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-900 ${
                          pathname === tool.path ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-500">
                          <Icon size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900 dark:text-white">{tool.name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{tool.desc}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Image & PDF Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('image')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  imagePdfTools.some(t => t.path === pathname)
                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                Image & PDF
                <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'image' ? 'rotate-180' : ''}`} />
              </button>

              {activeDropdown === 'image' && (
                <div className="absolute left-0 mt-0 w-64 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                  {imagePdfTools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <Link
                        key={tool.path}
                        href={tool.path}
                        className={`flex items-start gap-3 p-2 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-900 ${
                          pathname === tool.path ? 'bg-purple-50/50 dark:bg-purple-900/10' : ''
                        }`}
                      >
                        <div className="p-1.5 rounded-md bg-purple-50 dark:bg-purple-900/30 text-purple-500">
                          <Icon size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900 dark:text-white">{tool.name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{tool.desc}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-3 space-y-3">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Home
            </Link>
            
            <div className="border-t border-gray-100 dark:border-gray-850 pt-2">
              <p className="px-3 text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-1">Video Tools</p>
              {videoTools.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === link.path
                      ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="border-t border-gray-100 dark:border-gray-850 pt-2">
              <p className="px-3 text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-1">Image & PDF Tools</p>
              {imagePdfTools.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === link.path
                      ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
