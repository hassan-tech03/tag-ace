'use client';
import { useState } from 'react';
import Link from 'next/link';
import ProductCard from '../../../components/ui/ProductCard';

export default function UnisexShopPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  // All unisex products with categories and availability
  const allUnisexProducts = [
    { id: 9, name: 'Universal Scent', price: '$70.00', originalPrice: null, badge: 'New', category: 'eau-de-parfum', availability: 'in-stock' },
    { id: 10, name: 'Neutral Essence', price: '$60.00', originalPrice: '$80.00', badge: 'Sale', category: 'eau-de-toilette', availability: 'in-stock' },
    { id: 11, name: 'Pure Balance', price: '$85.00', originalPrice: null, badge: null, category: 'cologne', availability: 'out-of-stock' },
    { id: 12, name: 'Harmony Blend', price: '$75.00', originalPrice: null, badge: 'Popular', category: 'eau-de-parfum', availability: 'in-stock' },
    { id: 29, name: 'Fresh Air', price: '$55.00', originalPrice: null, badge: null, category: 'eau-de-toilette', availability: 'in-stock' },
    { id: 30, name: 'Clean Slate', price: '$90.00', originalPrice: null, badge: 'New', category: 'cologne', availability: 'in-stock' },
    { id: 31, name: 'Timeless', price: '$110.00', originalPrice: null, badge: 'Limited', category: 'eau-de-parfum', availability: 'out-of-stock' },
    { id: 32, name: 'Natural Breeze', price: '$65.00', originalPrice: '$85.00', badge: 'Sale', category: 'eau-de-toilette', availability: 'in-stock' },
    { id: 33, name: 'Zen Garden', price: '$50.00', originalPrice: null, badge: null, category: 'cologne', availability: 'in-stock' },
    { id: 34, name: 'Infinite', price: '$100.00', originalPrice: null, badge: 'Premium', category: 'eau-de-parfum', availability: 'in-stock' },
    { id: 35, name: 'Clarity', price: '$40.00', originalPrice: null, badge: null, category: 'eau-de-toilette', availability: 'out-of-stock' },
    { id: 36, name: 'Equilibrium', price: '$80.00', originalPrice: null, badge: 'Popular', category: 'cologne', availability: 'in-stock' },
    { id: 37, name: 'Serene Mist', price: '$45.00', originalPrice: null, badge: null, category: 'eau-de-toilette', availability: 'in-stock' },
    { id: 38, name: 'Cosmic Energy', price: '$115.00', originalPrice: null, badge: 'Premium', category: 'eau-de-parfum', availability: 'in-stock' },
    { id: 39, name: 'Pure Elements', price: '$70.00', originalPrice: null, badge: null, category: 'cologne', availability: 'in-stock' },
    { id: 40, name: 'Balanced Soul', price: '$95.00', originalPrice: '$120.00', badge: 'Sale', category: 'eau-de-parfum', availability: 'in-stock' }
  ];

  const categories = [
    { id: 'all', name: 'All Products', count: allUnisexProducts.length },
    { id: 'cologne', name: 'Cologne', count: allUnisexProducts.filter(p => p.category === 'cologne').length },
    { id: 'eau-de-parfum', name: 'Eau de Parfum', count: allUnisexProducts.filter(p => p.category === 'eau-de-parfum').length },
    { id: 'eau-de-toilette', name: 'Eau de Toilette', count: allUnisexProducts.filter(p => p.category === 'eau-de-toilette').length }
  ];

  // Filter products based on all criteria
  const filteredProducts = allUnisexProducts.filter(product => {
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    const availabilityMatch = selectedAvailability === 'all' || product.availability === selectedAvailability;
    const productPrice = parseFloat(product.price.replace('$', ''));
    const priceMatch = productPrice >= priceRange[0] && productPrice <= priceRange[1];
    
    return categoryMatch && availabilityMatch && priceMatch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = parseFloat(a.price.replace('$', ''));
    const priceB = parseFloat(b.price.replace('$', ''));
    
    switch (sortBy) {
      case 'price-low':
        return priceA - priceB;
      case 'price-high':
        return priceB - priceA;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="category-shop-page">
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/shop">Shop</Link>
            <span>/</span>
            <span>Unisex</span>
          </div>
          <h1>Unisex Fragrances</h1>
          <p>Discover our versatile collection for everyone</p>
        </div>
      </section>

      <div className="shop-layout">
        <div className="container">
          <div className="shop-content">
            {/* Desktop Filters Sidebar */}
            <aside className="filters-sidebar desktop-only">
              <div className="filters-container">
                <h3>Filters</h3>
                
                {/* Availability Filter */}
                <div className="filter-group">
                  <h4>Availability</h4>
                  <div className="filter-options">
                    <label className="filter-option">
                      <input
                        type="radio"
                        name="availability"
                        value="all"
                        checked={selectedAvailability === 'all'}
                        onChange={(e) => setSelectedAvailability(e.target.value)}
                      />
                      <span>All ({allUnisexProducts.length})</span>
                    </label>
                    <label className="filter-option">
                      <input
                        type="radio"
                        name="availability"
                        value="in-stock"
                        checked={selectedAvailability === 'in-stock'}
                        onChange={(e) => setSelectedAvailability(e.target.value)}
                      />
                      <span>In Stock ({allUnisexProducts.filter(p => p.availability === 'in-stock').length})</span>
                    </label>
                    <label className="filter-option">
                      <input
                        type="radio"
                        name="availability"
                        value="out-of-stock"
                        checked={selectedAvailability === 'out-of-stock'}
                        onChange={(e) => setSelectedAvailability(e.target.value)}
                      />
                      <span>Out of Stock ({allUnisexProducts.filter(p => p.availability === 'out-of-stock').length})</span>
                    </label>
                  </div>
                </div>

                {/* Price Range Filter */}
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
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 200])}
                      />
                    </div>
                  </div>
                </div>

                {/* Category Filter */}
                <div className="filter-group">
                  <h4>Category</h4>
                  <div className="filter-options">
                    {categories.map((category) => (
                      <label key={category.id} className="filter-option">
                        <input
                          type="radio"
                          name="category"
                          value={category.id}
                          checked={selectedCategory === category.id}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                        />
                        <span>{category.name} ({category.count})</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="products-main">
              {/* Mobile Filter Button & Sort */}
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
                  {sortedProducts.length} products
                </div>
              </div>

              {/* Products Grid */}
              <div className="products-grid">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {sortedProducts.length === 0 && (
                <div className="no-products">
                  <p>No products found matching your criteria.</p>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Mobile Filters Sidebar */}
      <div className={`mobile-filters-overlay ${isFilterOpen ? 'active' : ''}`}>
        <div className="mobile-filters-sidebar">
          <div className="filters-header">
            <h3>Filters</h3>
            <button 
              className="close-filters"
              onClick={() => setIsFilterOpen(false)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div className="filters-content">
            {/* Same filters as desktop */}
            <div className="filter-group">
              <h4>Availability</h4>
              <div className="filter-options">
                <label className="filter-option">
                  <input
                    type="radio"
                    name="availability-mobile"
                    value="all"
                    checked={selectedAvailability === 'all'}
                    onChange={(e) => setSelectedAvailability(e.target.value)}
                  />
                  <span>All ({allUnisexProducts.length})</span>
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="availability-mobile"
                    value="in-stock"
                    checked={selectedAvailability === 'in-stock'}
                    onChange={(e) => setSelectedAvailability(e.target.value)}
                  />
                  <span>In Stock ({allUnisexProducts.filter(p => p.availability === 'in-stock').length})</span>
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="availability-mobile"
                    value="out-of-stock"
                    checked={selectedAvailability === 'out-of-stock'}
                    onChange={(e) => setSelectedAvailability(e.target.value)}
                  />
                  <span>Out of Stock ({allUnisexProducts.filter(p => p.availability === 'out-of-stock').length})</span>
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
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 200])}
                  />
                </div>
              </div>
            </div>

            <div className="filter-group">
              <h4>Category</h4>
              <div className="filter-options">
                {categories.map((category) => (
                  <label key={category.id} className="filter-option">
                    <input
                      type="radio"
                      name="category-mobile"
                      value={category.id}
                      checked={selectedCategory === category.id}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    />
                    <span>{category.name} ({category.count})</span>
                  </label>
                ))}
              </div>
            </div>
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