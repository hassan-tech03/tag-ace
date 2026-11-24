'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const strokeIcon = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

// Shown only when the matching link is set in Admin → Site Content.
const SOCIALS = [
  {
    key: 'instagram',
    label: 'Instagram',
    icon: (
      <svg {...strokeIcon}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    key: 'facebook',
    label: 'Facebook',
    icon: (
      <svg {...strokeIcon}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
  {
    key: 'youtube',
    label: 'YouTube',
    icon: (
      <svg {...strokeIcon}>
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
      </svg>
    ),
  },
  {
    key: 'twitter',
    label: 'X (Twitter)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  // Contact details and social links come from Admin → Site Content
  // (/api/storefront/settings). Empty fields are simply not shown.
  const [info, setInfo] = useState({
    address: '',
    phone: '',
    email: '',
    description:
      "Mushk was founded on the belief that fragrance is more than just a scent — it's a powerful expression of personality and elegance.",
  });
  const [social, setSocial] = useState({
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
    tiktok: '',
  });

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling down 600px (approximately first section)
      if (window.scrollY > 600) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/storefront/settings', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((b) => {
        if (cancelled || !b) return;
        if (b.storeInfo) {
          setInfo((prev) => ({
            address: b.storeInfo.address || '',
            phone: b.storeInfo.phone || '',
            email: b.storeInfo.email || '',
            description: b.storeInfo.tagline || prev.description,
          }));
        }
        if (b.social) {
          setSocial((prev) => ({
            facebook: b.social.facebook || prev.facebook,
            instagram: b.social.instagram || prev.instagram,
            twitter: b.social.twitter || prev.twitter,
            youtube: b.social.youtube || prev.youtube,
            tiktok: b.social.tiktok || prev.tiktok,
          }));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button 
          className="floating-back-to-top"
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="18,15 12,9 6,15"></polyline>
          </svg>
        </button>
      )}

      <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="footer-logo">
              <Image
                src="/brand/mushk-logo.png"
                alt="Mushk Perfumes"
                width={379}
                height={339}
                className="footer-logo-img"
                style={{ height: '84px', width: 'auto' }}
              />
            </div>
            <p className="brand-description">
              {info.description}
            </p>
            {(info.address || info.phone || info.email) && (
              <div className="contact-info">
                {info.address && <p>📍 {info.address}</p>}
                {info.phone && (
                  <p>
                    📞 <a href={`tel:${info.phone.replace(/[^+0-9]/g, '')}`}>{info.phone}</a>
                  </p>
                )}
                {info.email && (
                  <p>
                    ✉ <a href={`mailto:${info.email}`}>{info.email}</a>
                  </p>
                )}
              </div>
            )}
            {SOCIALS.some((x) => social[x.key]) && (
              <div className="social-links">
                {SOCIALS.filter((x) => social[x.key]).map((x) => (
                  <a
                    key={x.key}
                    href={social[x.key]}
                    className="social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={x.label}
                    title={x.label}
                  >
                    {x.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Customer Service */}
          <div className="footer-section">
            <h4>Customer Service</h4>
            <ul className="footer-links">
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/cart">Your Cart</Link></li>
              <li><Link href="/contact">Help & Support</Link></li>
            </ul>
          </div>

          {/* Information */}
          <div className="footer-section">
            <h4>Shop</h4>
            <ul className="footer-links">
              <li><Link href="/shop">All Fragrances</Link></li>
              <li><Link href="/shop/men">Men</Link></li>
              <li><Link href="/shop/women">Women</Link></li>
              <li><Link href="/about">About Us</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-section newsletter-section">
            <h4>Newsletter</h4>
            <p className="newsletter-text">
              Subscribe to our newsletter to receive news on update.
            </p>
            <div className="newsletter-form">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="newsletter-input"
              />
              <button className="newsletter-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <div className="payment-methods">
              <div className="payment-card">VISA</div>
              <div className="payment-card">MASTERCARD</div>
              <div className="payment-card">CASH ON DELIVERY</div>
            </div>
          </div>
          <div className="footer-bottom-center">
            <p>&copy; {new Date().getFullYear()} Mushk Perfumes. All rights reserved.</p>
          </div>
          <div className="footer-bottom-right">
            {/* Remove the old back to top button from footer */}
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}