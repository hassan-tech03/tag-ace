'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import productsData from '../../data/products.json';

const ALL_PRODUCTS = productsData.products;

const POPULAR = ['Rose', 'Oud', 'Floral', 'Woody', 'Men', 'Women', 'Oriental'];

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
      setQuery('');
      setResults([]);
      setActiveIdx(-1);
    }
  }, [isOpen]);

  // Search
  useEffect(() => {
    if (!query.trim()) { setResults([]); setActiveIdx(-1); return; }
    const q = query.toLowerCase();
    const filtered = ALL_PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.fragrance_family.toLowerCase().includes(q) ||
      (p.notes?.top || []).some(n => n.toLowerCase().includes(q)) ||
      (p.notes?.middle || []).some(n => n.toLowerCase().includes(q))
    ).slice(0, 8);
    setResults(filtered);
    setActiveIdx(-1);
  }, [query]);

  // Keyboard nav
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
    if (e.key === 'Enter' && activeIdx >= 0 && results[activeIdx]) {
      onClose();
      window.location.href = `/products/${results[activeIdx].id}`;
    }
  }, [isOpen, results, activeIdx, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>

        {/* Search Input Row */}
        <div className="search-modal-input-row">
          <svg className="search-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="search-modal-input"
            placeholder="Search fragrances, brands, notes…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoComplete="off"
          />
          {query && (
            <button className="search-clear-btn" onClick={() => setQuery('')} aria-label="Clear">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
          <button className="search-modal-close" onClick={onClose} aria-label="Close search">
            <span>ESC</span>
          </button>
        </div>

        {/* Body */}
        <div className="search-modal-body">
          {/* No query — show popular searches */}
          {!query && (
            <div className="search-popular">
              <p className="search-section-label">Popular Searches</p>
              <div className="search-tags">
                {POPULAR.map(tag => (
                  <button key={tag} className="search-tag" onClick={() => setQuery(tag)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    {tag}
                  </button>
                ))}
              </div>
              <p className="search-section-label" style={{ marginTop: '28px' }}>Browse Categories</p>
              <div className="search-categories">
                {[
                  { label: "Men's", href: '/shop/men', icon: '♂' },
                  { label: "Women's", href: '/shop/women', icon: '♀' },
                  { label: 'Unisex', href: '/shop/unisex', icon: '◎' },
                  { label: 'All Products', href: '/shop', icon: '✦' },
                ].map(c => (
                  <Link key={c.href} href={c.href} className="search-category-chip" onClick={onClose}>
                    <span className="chip-icon">{c.icon}</span>
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Has query — show results */}
          {query && results.length > 0 && (
            <div className="search-results">
              <p className="search-section-label">{results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;</p>
              <ul className="search-results-list">
                {results.map((product, idx) => (
                  <li key={product.id}>
                    <Link
                      href={`/products/${product.id}`}
                      className={`search-result-item${activeIdx === idx ? ' active' : ''}`}
                      onClick={onClose}
                    >
                      <div className="result-image">
                        <Image
                          src="/1_08ff09db-b9b0-4781-8774-8c5872176160_360x.webp"
                          alt={product.name}
                          width={56}
                          height={56}
                        />
                      </div>
                      <div className="result-info">
                        <span className="result-name">{highlightMatch(product.name, query)}</span>
                        <span className="result-meta">
                          <span className={`result-category result-category--${product.category}`}>{product.category}</span>
                          <span className="result-dot">·</span>
                          <span>{product.fragrance_family}</span>
                          <span className="result-dot">·</span>
                          <span>{product.size}</span>
                        </span>
                      </div>
                      <div className="result-price">
                        <span className="result-current">${product.price.toFixed(2)}</span>
                        {product.originalPrice > product.price && (
                          <span className="result-original">${product.originalPrice.toFixed(2)}</span>
                        )}
                      </div>
                      <svg className="result-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9,18 15,12 9,6"/>
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href={`/shop`} className="search-view-all" onClick={onClose}>
                View all results in shop
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6"/>
                </svg>
              </Link>
            </div>
          )}

          {/* No results */}
          {query && results.length === 0 && (
            <div className="search-no-results">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <p className="no-results-title">No results for &ldquo;{query}&rdquo;</p>
              <p className="no-results-sub">Try a different keyword or browse our categories</p>
              <div className="search-tags" style={{ justifyContent: 'center', marginTop: '16px' }}>
                {POPULAR.slice(0, 4).map(tag => (
                  <button key={tag} className="search-tag" onClick={() => setQuery(tag)}>{tag}</button>
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
