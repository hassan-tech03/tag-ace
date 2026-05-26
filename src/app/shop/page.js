'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductCard from '../../components/ui/ProductCard';

const SECTIONS = [
  { key: 'men', title: "Men's Fragrances" },
  { key: 'women', title: "Women's Fragrances" },
  { key: 'unisex', title: 'Unisex Fragrances' },
];

function SkeletonGrid({ count = 4 }) {
  return (
    <div className="products-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="product-skeleton" aria-hidden="true">
          <div className="skeleton-image" />
          <div className="skeleton-line skeleton-line--title" />
          <div className="skeleton-line skeleton-line--meta" />
          <div className="skeleton-line skeleton-line--price" />
        </div>
      ))}
    </div>
  );
}

const ProductSection = ({ title, products, category, loading }) => {
  // Don't render the section at all once we know the DB has nothing for it.
  if (!loading && products.length === 0) return null;
  return (
    <section className="shop-category-section">
      <div className="container">
        <div className="section-header">
          <h2>{title}</h2>
          <Link href={`/shop/${category}`} className="view-all-link">
            View All
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </Link>
        </div>

        <div className="products-container">
          {loading ? (
            <SkeletonGrid count={4} />
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default function ShopPage() {
  const [products, setProducts] = useState({ men: [], women: [], unisex: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchProducts = (qs) =>
      fetch(`/api/storefront/products?${qs}`, { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((b) => (b?.items ? b.items : []))
        .catch(() => []);

    (async () => {
      const [men, women, unisex] = await Promise.all([
        fetchProducts('category=men&limit=4&sort=-createdAt'),
        fetchProducts('category=women&limit=4&sort=-createdAt'),
        fetchProducts('category=unisex&limit=4&sort=-createdAt'),
      ]);
      if (!cancelled) {
        setProducts({ men, women, unisex });
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const total = products.men.length + products.women.length + products.unisex.length;

  return (
    <div className="shop-page">
      <section className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>Shop</span>
          </div>
          <h1>Our Perfume Collection</h1>
          <p>Discover our exquisite range of fragrances for every occasion</p>
        </div>
      </section>

      {SECTIONS.map((s) => (
        <ProductSection
          key={s.key}
          title={s.title}
          products={products[s.key]}
          category={s.key}
          loading={loading}
        />
      ))}

      {!loading && total === 0 && (
        <section className="shop-category-section">
          <div className="container">
            <div className="empty-state">
              <h3>No products available yet</h3>
              <p>The catalog is being curated. Once products are published in <strong>Admin → Products</strong>, they'll appear here automatically.</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
