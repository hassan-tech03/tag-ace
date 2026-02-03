'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mobileExpandedItems, setMobileExpandedItems] = useState({});
  const [cartItems, setCartItems] = useState([]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setMobileExpandedItems({});
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const toggleMobileExpand = (item) => {
    setMobileExpandedItems(prev => {
      // If clicking on a main section (categories, allPerfumes, etc.), close others
      if (['categories', 'allPerfumes', 'offers', 'support'].includes(item)) {
        return {
          ...prev,
          // Close all other subsections
          categories: item === 'categories' ? !prev[item] : false,
          allPerfumes: item === 'allPerfumes' ? !prev[item] : false,
          offers: item === 'offers' ? !prev[item] : false,
          support: item === 'support' ? !prev[item] : false,
          // Keep shop and pages as they are
          shop: prev.shop,
          pages: prev.pages
        };
      }
      // For shop and pages, just toggle normally
      return {
        ...prev,
        [item]: !prev[item]
      };
    });
  };

  return (
    <header className="header">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="container">
          <div className="top-bar-content">
            <div className="top-bar-left">
              <span>Order Online Call Us (0123) 456789</span>
            </div>
            <div className="top-bar-right">
              <span className="find-store">📍 Find a Store</span>
              <span className="email">✉ demo@arome.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="main-header">
        <div className="container">
          <div className="header-content">
            {/* Mobile Menu Button - Now for both mobile and desktop */}
            <button 
              className="mobile-menu-btn"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            {/* Remove Desktop Navigation - We'll use sidebar for all */}

            {/* Logo */}
            <div className="logo">
              <Link href="/">
                <img src="/logo.png" alt="AROME PERFUME SHOP" className="logo-img" />
              </Link>
            </div>

            {/* Right Side Icons */}
            <div className="header-icons">
              <div className="search-box d-none d-md-flex">
                <input type="text" placeholder="Search our store" />
                <button className="search-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </button>
              </div>
              <button className="icon-btn search-mobile d-md-none">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </button>
              <button className="icon-btn wishlist">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
              <button className="icon-btn cart" onClick={toggleCart}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z"></path>
                  <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z"></path>
                  <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6"></path>
                </svg>
                <span className="cart-count">{cartItems.length}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu">
          <div className="mobile-menu-header">
            <div className="logo">
              <img src="/logo.png" alt="AROME PERFUME SHOP" />
            </div>
            <button className="close-btn" onClick={toggleMobileMenu}>✕</button>
          </div>
          <nav className="mobile-nav">
            <div className="nav-item">
              <Link href="/" className="nav-link" onClick={toggleMobileMenu}>HOME</Link>
            </div>
            
            <div className="nav-item">
              <Link href="/products" className="nav-link">SHOP</Link>
              <button 
                className="expand-btn"
                onClick={() => toggleMobileExpand('shop')}
              >
                {mobileExpandedItems.shop ? '−' : '+'}
              </button>
            </div>
            
            {mobileExpandedItems.shop && (
              <div className="mobile-submenu">
                <div className="submenu-section">
                  <h5>Categories</h5>
                  <button 
                    className="submenu-toggle"
                    onClick={() => toggleMobileExpand('categories')}
                  >
                    {mobileExpandedItems.categories ? '−' : '−'}
                  </button>
                </div>
                {mobileExpandedItems.categories && (
                  <div className="submenu-items">
                    <Link href="/products/eau-de-parfum" onClick={toggleMobileMenu}>Eau de Parfum</Link>
                    <Link href="/products/eau-de-toilette" onClick={toggleMobileMenu}>Eau de Toilette</Link>
                    <Link href="/products/body-mists" onClick={toggleMobileMenu}>Body Mists</Link>
                    <Link href="/products/travel-sizes" onClick={toggleMobileMenu}>Travel Sizes</Link>
                  </div>
                )}
                
                <div className="submenu-section">
                  <h5>All Perfumes</h5>
                  <button 
                    className="submenu-toggle"
                    onClick={() => toggleMobileExpand('allPerfumes')}
                  >
                    {mobileExpandedItems.allPerfumes ? '−' : '+'}
                  </button>
                </div>
                {mobileExpandedItems.allPerfumes && (
                  <div className="submenu-items">
                    <Link href="/products/mens-fragrances" onClick={toggleMobileMenu}>Men's Fragrances</Link>
                    <Link href="/products/womens-fragrances" onClick={toggleMobileMenu}>Women's Fragrances</Link>
                    <Link href="/products/unisex-perfumes" onClick={toggleMobileMenu}>Unisex Perfumes</Link>
                    <Link href="/products/new-arrivals" onClick={toggleMobileMenu}>New Arrivals</Link>
                  </div>
                )}
                
                <div className="submenu-section">
                  <h5>Offers & Discounts</h5>
                  <button 
                    className="submenu-toggle"
                    onClick={() => toggleMobileExpand('offers')}
                  >
                    {mobileExpandedItems.offers ? '−' : '+'}
                  </button>
                </div>
                {mobileExpandedItems.offers && (
                  <div className="submenu-items">
                    <Link href="/products/limited-editions" onClick={toggleMobileMenu}>Limited Editions</Link>
                    <Link href="/products/best-sellers" onClick={toggleMobileMenu}>Best Sellers</Link>
                    <Link href="/products/seasonal-sales" onClick={toggleMobileMenu}>Seasonal Sales</Link>
                    <Link href="/products/clearance-sale" onClick={toggleMobileMenu}>Clearance Sale</Link>
                  </div>
                )}
                
                <div className="submenu-section">
                  <h5>Contact & Support</h5>
                  <button 
                    className="submenu-toggle"
                    onClick={() => toggleMobileExpand('support')}
                  >
                    {mobileExpandedItems.support ? '−' : '+'}
                  </button>
                </div>
                {mobileExpandedItems.support && (
                  <div className="submenu-items">
                    <Link href="/customer-service" onClick={toggleMobileMenu}>Customer Service</Link>
                    <Link href="/track-your-order" onClick={toggleMobileMenu}>Track Your Order</Link>
                    <Link href="/shipping-returns" onClick={toggleMobileMenu}>Shipping & Returns</Link>
                    <Link href="/faq" onClick={toggleMobileMenu}>FAQ</Link>
                  </div>
                )}
              </div>
            )}
            
            <div className="nav-item">
              <Link href="/blog" className="nav-link" onClick={toggleMobileMenu}>BLOG</Link>
            </div>
            
            <div className="nav-item">
              <Link href="/pages" className="nav-link">PAGES</Link>
              <button 
                className="expand-btn"
                onClick={() => toggleMobileExpand('pages')}
              >
                {mobileExpandedItems.pages ? '−' : '+'}
              </button>
            </div>
            
            {mobileExpandedItems.pages && (
              <div className="mobile-submenu">
                <div className="submenu-items" style={{padding: '0 40px 15px'}}>
                  <Link href="/about" onClick={toggleMobileMenu}>About Us</Link>
                  <Link href="/faq" onClick={toggleMobileMenu}>FAQ Page</Link>
                  <Link href="/contact" onClick={toggleMobileMenu}>Contact Us</Link>
                  <Link href="/wishlist" onClick={toggleMobileMenu}>Wishlist Page</Link>
                  <Link href="/terms" onClick={toggleMobileMenu}>Terms & Conditions</Link>
                  <Link href="/privacy" onClick={toggleMobileMenu}>Privacy Policy</Link>
                  <Link href="/size-guide" onClick={toggleMobileMenu}>Size Guide</Link>
                  <Link href="/404" onClick={toggleMobileMenu}>404 Error Page</Link>
                </div>
              </div>
            )}
            
            <div className="nav-item">
              <Link href="/contact" className="nav-link" onClick={toggleMobileMenu}>CONTACT</Link>
            </div>
          </nav>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className={`cart-overlay ${isCartOpen ? 'active' : ''}`}>
        <div className="cart-sidebar">
          <div className="cart-header">
            <h3>{cartItems.length > 0 ? 'Item added to your cart' : 'Shopping Cart'}</h3>
            <button className="close-btn" onClick={toggleCart}>✕</button>
          </div>
          
          <div className="cart-content">
            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1">
                    <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z"></path>
                    <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z"></path>
                    <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6"></path>
                  </svg>
                </div>
                <h4>Your cart is empty</h4>
                <button className="continue-shopping" onClick={toggleCart}>
                  Continue shopping
                </button>
              </div>
            ) : (
              <div className="cart-items">
                {cartItems.map((item, index) => (
                  <div key={index} className="cart-item">
                    <div className="item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="item-details">
                      <div className="item-brand">AROME</div>
                      <div className="item-name">{item.name}</div>
                      <div className="item-specs">
                        <span>Color: {item.color}</span>
                        <span>Weight: {item.weight}</span>
                      </div>
                      <div className="item-price">${item.price}</div>
                      <div className="item-controls">
                        <button className="qty-btn">-</button>
                        <span className="qty">1</span>
                        <button className="qty-btn">+</button>
                        <button className="remove-btn">Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {cartItems.length > 0 && (
            <div className="cart-footer">
              <div className="cart-actions">
                <button className="note-btn">📝 Note</button>
                <button className="shipping-btn">🚚 Shipping</button>
              </div>
              <div className="cart-total">
                <div className="subtotal">
                  <span>Subtotal</span>
                  <span>$79.00 USD</span>
                </div>
              </div>
              <div className="cart-buttons">
                <button className="view-cart-btn">VIEW CART</button>
                <button className="checkout-btn">CHECK OUT</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}