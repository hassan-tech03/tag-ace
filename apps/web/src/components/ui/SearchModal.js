'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from "@/lib/money";
import { imageUrl } from "@/lib/images";
import { useDialog } from "@/hooks/useDialog";

const POPULAR = ['Rose', 'Oud', 'Floral', 'Woody', 'Men', 'Women', 'Oriental'];

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);
  const requestRef = useRef(0);
  const modalRef = useRef(null);
  useDialog(isOpen, onClose, modalRef);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 30);
      setQuery('');
      setResults([]);
      setActiveIdx(-1);
    }
  }, [isOpen]);

  // Debounced live search against the storefront API. Results are already
  // in storefront shape (numeric price, image URL, gender, fragranceFamily).
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setActiveIdx(-1);
      setSearching(false);
      return;
    }

    const reqId = ++requestRef.current;
    setSearching(true);
    const handle = setTimeout(() => {
      fetch(
        `/api/storefront/products?search=${encodeURIComponent(query.trim())}&limit=8`,
        { cache: 'no-store' }
      )
        .then((r) => (r.ok ? r.json() : null))
        .then((b) => {
          if (requestRef.current !== reqId) return;
          setResults(Array.isArray(b?.items) ? b.items : []);
          setActiveIdx(-1);
        })
        .catch(() => {
          if (requestRef.current === reqId) setResults([]);
        })
        .finally(() => {
          if (requestRef.current === reqId) setSearching(false);
        });
    }, 220);

    return () => clearTimeout(handle);
  }, [query]);

  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, results.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, -1));
      }
      if (e.key === 'Enter' && activeIdx >= 0 && results[activeIdx]) {
        onClose();
        window.location.href = `/products/${results[activeIdx].slug || results[activeIdx].id}`;
      }
    },
    [isOpen, results, activeIdx, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div
        className="search-modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search fragrances"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="search-modal-input-row">
          <svg className="search-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="search-modal-input"
            placeholder="Search fragrances, brands, notes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          {query && (
            <button className="search-clear-btn" onClick={() => setQuery('')} aria-label="Clear">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
          <button className="search-modal-close" onClick={onClose} aria-label="Close search">
            <span>ESC</span>
          </button>
        </div>

        <div className="search-modal-body">
          {!query && (
            <div className="search-popular">
              <p className="search-section-label">Popular Searches</p>
              <div className="search-tags">
                {POPULAR.map((tag) => (
                  <button key={tag} className="search-tag" onClick={() => setQuery(tag)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    {tag}
                  </button>
                ))}
              </div>
              <p className="search-section-label" style={{ marginTop: '28px' }}>Browse Categories</p>
              <div className="search-categories">
                {[
                  { label: "Men's Fragrances", href: '/shop/men' },
                  { label: "Women's Fragrances", href: '/shop/women' },
                  { label: 'All Perfumes', href: '/shop' },
                ].map((c) => (
                  <Link key={c.href} href={c.href} className="search-category-chip" onClick={onClose}>
                    <svg className="chip-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M10 2h4v3h-4z" />
                      <path d="M9 5h6l1 3H8z" />
                      <rect x="6" y="8" width="12" height="14" rx="2" />
                    </svg>
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {query && searching && results.length === 0 && (
            <div className="search-loading" role="status" aria-live="polite">
              <span className="search-spinner" aria-hidden="true" />
              <span>Searching…</span>
            </div>
          )}

          {query && !searching && results.length > 0 && (
            <div className="search-results">
              <p className="search-section-label">
                {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
              </p>
              <ul className="search-results-list">
                {results.map((product, idx) => (
                  <li key={product.id}>
                    <Link
                      href={`/products/${product.slug || product.id}`}
                      className={`search-result-item${activeIdx === idx ? ' active' : ''}`}
                      onClick={onClose}
                    >
                      <div className="result-image">
                        <Image
                          src={imageUrl(product.image, 120) || '/brand/mushk-icon.png'}
                          alt={product.name}
                          width={56}
                          height={56}
                          unoptimized={!!product.image}
                        />
                      </div>
                      <div className="result-info">
                        <span className="result-name">{highlightMatch(product.name, query)}</span>
                        <span className="result-meta">
                          {product.gender && (
                            <span className={`result-category result-category--${product.gender}`}>
                              {product.gender}
                            </span>
                          )}
                          {product.fragranceFamily && (
                            <>
                              <span className="result-dot">·</span>
                              <span>{product.fragranceFamily}</span>
                            </>
                          )}
                          {product.size && (
                            <>
                              <span className="result-dot">·</span>
                              <span>{product.size}</span>
                            </>
                          )}
                        </span>
                      </div>
                      <div className="result-price">
                        <span className="result-current">{formatPrice(Number(product.price || 0))}</span>
                        {product.originalPrice > product.price && (
                          <span className="result-original">{formatPrice(Number(product.originalPrice))}</span>
                        )}
                      </div>
                      <svg className="result-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9,18 15,12 9,6" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href={`/shop`} className="search-view-all" onClick={onClose}>
                Browse all perfumes
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6" />
                </svg>
              </Link>
            </div>
          )}

          {query && !searching && results.length === 0 && (
            <div className="search-no-results">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <p className="no-results-title">No results for &ldquo;{query}&rdquo;</p>
              <p className="no-results-sub">Try a different keyword or browse our categories</p>
              <div className="search-tags" style={{ justifyContent: 'center', marginTop: '16px' }}>
                {POPULAR.slice(0, 4).map((tag) => (
                  <button key={tag} className="search-tag" onClick={() => setQuery(tag)}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function highlightMatch(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}
