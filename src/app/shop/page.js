'use client';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '../../components/ui/ProductCard';

// Product Section Component
const ProductSection = ({ title, products, category }) => (
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
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default function ShopPage() {
  // Sample product data
  const menProducts = [
    { id: 1, name: 'Masculine Power', price: '$85.00', originalPrice: null, badge: 'New', category: 'men' },
    { id: 2, name: 'Strong Essence', price: '$70.00', originalPrice: '$90.00', badge: 'Sale', category: 'men' },
    { id: 3, name: 'Bold Spirit', price: '$90.00', originalPrice: null, badge: null, category: 'men' },
    { id: 4, name: 'Urban Legend', price: '$65.00', originalPrice: null, badge: 'Popular', category: 'men' }
  ];

  const womenProducts = [
    { id: 5, name: 'Rose Elegance', price: '$75.00', originalPrice: null, badge: 'New', category: 'women' },
    { id: 6, name: 'Floral Dreams', price: '$55.00', originalPrice: '$75.00', badge: 'Sale', category: 'women' },
    { id: 7, name: 'Feminine Touch', price: '$80.00', originalPrice: null, badge: null, category: 'women' },
    { id: 8, name: 'Lady Charm', price: '$95.00', originalPrice: null, badge: 'Popular', category: 'women' }
  ];

  const unisexProducts = [
    { id: 9, name: 'Universal Scent', price: '$70.00', originalPrice: null, badge: 'New', category: 'unisex' },
    { id: 10, name: 'Neutral Essence', price: '$60.00', originalPrice: '$80.00', badge: 'Sale', category: 'unisex' },
    { id: 11, name: 'Pure Balance', price: '$85.00', originalPrice: null, badge: null, category: 'unisex' },
    { id: 12, name: 'Harmony Blend', price: '$75.00', originalPrice: null, badge: 'Popular', category: 'unisex' }
  ];

  return (
    <div className="shop-page">
      {/* Page Header */}
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

      {/* Men Section */}
      <ProductSection title="Men's Fragrances" products={menProducts} category="men" />

      {/* Women Section */}
      <ProductSection title="Women's Fragrances" products={womenProducts} category="women" />

      {/* Unisex Section */}
      <ProductSection title="Unisex Fragrances" products={unisexProducts} category="unisex" />
    </div>
  );
}