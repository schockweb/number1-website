"use client";

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'n1_construction_banner_dismissed';

export default function ConstructionBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Remember dismissal for the browser session only, so returning visitors still see it.
    if (sessionStorage.getItem(STORAGE_KEY) !== '1') setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
        padding: '0.75rem 3rem 0.75rem 1rem',
        background: '#000000', color: '#FFFFFF',
        fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700,
        letterSpacing: '0.04em', textAlign: 'center',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.15)',
      }}
    >
      <span>
        🚧 This website is currently under construction. For enquiries, reach out at{' '}
        <a
          href="mailto:schockweb@gmail.com"
          style={{ color: '#EA580C', textDecoration: 'underline', fontWeight: 800 }}
        >
          schockweb@gmail.com
        </a>
      </span>
      <button
        onClick={() => { sessionStorage.setItem(STORAGE_KEY, '1'); setVisible(false); }}
        aria-label="Dismiss banner"
        style={{
          position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', color: '#FFFFFF',
          fontSize: '1rem', fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace',
        }}
      >
        ✕
      </button>
    </div>
  );
}
