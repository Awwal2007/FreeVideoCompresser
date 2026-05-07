'use client';

import { useEffect, useRef } from 'react';

interface AdBannerProps {
  slot: string;
  format?: 'leaderboard' | 'rectangle' | 'mobile' | 'skyscraper';
  className?: string;
}

/**
 * AdBanner Component
 * Renders Google AdSense placeholder divs with proper data-ad-* attributes.
 * Falls back to a placeholder box during development.
 */
export default function AdBanner({ slot, format = 'rectangle', className = '' }: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);

  // Dimensions based on format
  const dimensions = {
    leaderboard: { width: 728, height: 90 },
    rectangle: { width: 300, height: 250 },
    skyscraper: { width: 160, height: 600 },
    mobile: { width: 320, height: 50 }
  };

  const { width, height } = dimensions[format];

  useEffect(() => {
    // Only attempt to load Google AdSense in production
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined' && (window as any).adsbygoogle) {
      try {
        (window as any).adsbygoogle.push({});
      } catch (e) {
        console.warn('[AdBanner] AdSense push failed:', e);
      }
    }
  }, []);

  const isProduction = process.env.NODE_ENV === 'production';

  return (
    <div
      className={`flex flex-col items-center justify-center ${className}`}
      style={{
        minWidth: width,
        maxWidth: width,
        minHeight: height,
        maxHeight: height
      }}
    >
      {isProduction ? (
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: 'inline-block',
            width,
            height
          }}
          data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-XXXXXXXXXXXXXXXX"} // Replace with actual AdSense client ID
          data-ad-slot={slot}
          data-ad-format={format === 'mobile' ? 'auto' : format}
          data-full-width-responsive={format === 'mobile' ? 'true' : 'false'}
        />
      ) : (
        <div
          className="flex flex-col items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded text-gray-400 text-xs select-none"
          style={{
            width,
            height
          }}
        >
          <span className="font-semibold uppercase tracking-wider text-gray-400">Advertisement</span>
          <span className="text-[10px] mt-1">{width}x{height}</span>
          <span className="text-[10px]">Slot: {slot}</span>
        </div>
      )}
    </div>
  );
}
