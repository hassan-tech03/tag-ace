'use client';

import { useEffect, useState } from 'react';

// Renders an email address only in the browser. Cloudflare's "Email Address
// Obfuscation" rewrites addresses found in server HTML, which makes React's
// hydration fail; an address added after hydration is left alone.
export default function EmailLink({ email, className }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <span className={className}>our email</span>;
  return (
    <a href={`mailto:${email}`} className={className}>
      {email}
    </a>
  );
}
