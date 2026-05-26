'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import ProductCard from '../ui/ProductCard';
import { FRAGRANCE_FAMILIES } from '../../lib/storefrontCategories';

// One shared implementation for /shop/men, /shop/women and /shop/unisex.
// All data comes from the storefront API; if there are no products yet the
// page renders a polite empty state instead of dummy data.
//
// The "Category" filter shows the same fragrance families admins choose
// from in the dashboard, so the two surfaces stay aligned.
export default function GenderShop({ gender, title, description }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedFamily, setSelectedFamily] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/storefront/products?category=${encodeURIComponent(gender)}&limit=60&sort=-createdAt`, {
      cache: 'no-store',
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((b) => {
        if (cancelled) return;
        setProducts(Array.isArray(b?.items) ? b.items : []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [gender]);

  // Only show family filter chips that actually have products in this set.
  const familiesPresent = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.fragranceFamily) set.add(p.fragranceFamily);
    });
    return FRAGRANCE_FAMILIES.filter((f) => set.has(f));
  }, [products]);

  const filterCategories = useMemo(() => {
    const inFamily = (f) => products.filter((p) => p.fragranceFamily === f).length;
    return [
      { id: 'all', name: 'All Products', count: products.length },
      ...familiesPresent.map((f) => ({ id: f, name: f, count: inFamily(f) })),
    ];
  }, [products, familiesPresent]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const familyMatch =
        selectedFamily === 'all' || p.fragranceFamily === selectedFamily;
      const availabilityMatch =
        selectedAvailability === 'all' || p.availability === selectedAvailability;
      const price = Number(p.price || 0);
      const priceMatch = price >= priceRange[0] && price <= priceRange[1];
      return familyMatch && availabilityMatch && priceMatch;
    });
  }, [products, selectedFamily, selectedAvailability, priceRange]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    const priceOf = (p) => Number(p.price || 0);
    switch (sortBy) {
      case 'price-low':
        return list.sort((a, b) => priceOf(a) - priceOf(b));
      case 'price-high':
        return list.sort((a, b) => priceOf(b) - priceOf(a));
      case 'name':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return list;
    }
  }, [filtered, sortBy]);

  const labelCap = gender.charAt(0).toUpperCase() + gender.slice(1);

  return (
    <div className="category-shop-page">
      <section className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/shop">Shop</Link>
            <span>/</span>
            <span>{labelCap}</span>
          </div>
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>
      </section>

      <div className="shop-layout">
        <div className="container">
          <div className="shop-content">
            <aside className="filters-sidebar desktop-only">
              <FiltersBody
                products={products}
                categories={filterCategories}
                selectedFamily={selectedFamily}
                setSelectedFamily={setSelectedFamily}
                selectedAvailability={selectedAvailability}
                setSelectedAvailability={setSelectedAvailability}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                familySuffix=""
              />
            </aside>

            <main className="products-main">
              <div className="products-header">
                <button
                  className="filter-toggle-btn mobile-only"
                  onClick={() => setIsFilterOpen(true)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="4" y1="21" x2="4" y2="14"></line>
                    <line x1="4" y1="10" x2="4" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12" y2="3"></line>
                    <line x1="20" y1="21" x2="20" y2="16"></line>
                    <line x1="20" y1="12" x2="20" y2="3"></line>
                    <line x1="1" y1="14" x2="7" y2="14"></line>
                    <line x1="9" y1="8" x2="15" y2="8"></line>
                    <line x1="17" y1="16" x2="23" y2="16"></line>
                  </svg>
                  Filters
                </button>

                <div className="sort-controls">
                  <label>Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                  </select>
                </div>

                <div className="results-count">
                  {loading ? 'Loading…' : `${sorted.length} products`}
                </div>
              </div>

              {loading ? (
                <div className="products-grid">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="product-skeleton" aria-hidden="true">
                      <div className="skeleton-image" />
                      <div className="skeleton-line skeleton-line--title" />
                      <div className="skeleton-line skeleton-line--meta" />
                      <div className="skeleton-line skeleton-line--price" />
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="empty-state">
                  <h3>No {labelCap.toLowerCase()} fragrances yet</h3>
                  <p>
                    Once products are published under <strong>Admin → Products</strong> with the <em>{gender}</em> category, they will show up here.
                  </p>
                </div>
              ) : (
                <>
                  <div className="products-grid">
                    {sorted.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {sorted.length === 0 && (
                    <div className="no-products">
                      <p>No products match your current filters.</p>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Mobile filters drawer */}
      <div className={`mobile-filters-overlay ${isFilterOpen ? 'active' : ''}`}>
        <div className="mobile-filters-sidebar">
          <div className="filters-header">
            <h3>Filters</h3>
            <button className="close-filters" onClick={() => setIsFilterOpen(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="filters-content">
            <FiltersBody
              products={products}
              categories={filterCategories}
              selectedFamily={selectedFamily}
              setSelectedFamily={setSelectedFamily}
              selectedAvailability={selectedAvailability}
              setSelectedAvailability={setSelectedAvailability}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              familySuffix="-mobile"
            />
          </div>

          <div className="filters-footer">
            <button
              className="apply-filters-btn"
              onClick={() => setIsFilterOpen(false)}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FiltersBody({
  products,
  categories,
  selectedFamily,
  setSelectedFamily,
  selectedAvailability,
  setSelectedAvailability,
  priceRange,
  setPriceRange,
  familySuffix,
}) {
  return (
    <div className="filters-container">
      <h3>Filters</h3>

      <div className="filter-group">
        <h4>Availability</h4>
        <div className="filter-options">
          <label className="filter-option">
            <input
              type="radio"
              name={`availability${familySuffix}`}
              value="all"
              checked={selectedAvailability === 'all'}
              onChange={(e) => setSelectedAvailability(e.target.value)}
            />
            <span>All ({products.length})</span>
          </label>
          <label className="filter-option">
            <input
              type="radio"
              name={`availability${familySuffix}`}
              value="in-stock"
              checked={selectedAvailability === 'in-stock'}
              onChange={(e) => setSelectedAvailability(e.target.value)}
            />
            <span>In Stock ({products.filter((p) => p.availability === 'in-stock').length})</span>
          </label>
          <label className="filter-option">
            <input
              type="radio"
              name={`availability${familySuffix}`}
              value="out-of-stock"
              checked={selectedAvailability === 'out-of-stock'}
              onChange={(e) => setSelectedAvailability(e.target.value)}
            />
            <span>Out of Stock ({products.filter((p) => p.availability === 'out-of-stock').length})</span>
          </label>
        </div>
      </div>

      <div className="filter-group">
        <h4>Price Range</h4>
        <div className="price-range">
          <div className="price-inputs">
            <input
              type="number"
              placeholder="Min Price"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max Price"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 500])}
            />
          </div>
        </div>
      </div>

      {categories.length > 1 && (
        <div className="filter-group">
          <h4>Fragrance Family</h4>
          <div className="filter-options">
            {categories.map((cat) => (
              <label key={cat.id} className="filter-option">
                <input
                  type="radio"
                  name={`family${familySuffix}`}
                  value={cat.id}
                  checked={selectedFamily === cat.id}
                  onChange={(e) => setSelectedFamily(e.target.value)}
                />
                <span>
                  {cat.name} ({cat.count})
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
