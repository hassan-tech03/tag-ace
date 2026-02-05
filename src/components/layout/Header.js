'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartContext } from '../../context/CartContext';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [shopExpanded, setShopExpanded] = useState(false);
  const [pagesExpanded, setPagesExpanded] = useState(false);
  const { cartItems, getCartItemsCount, getCartTotal, updateQuantity, removeFromCart } = useCartContext();
  const router = useRouter();

  const handleNavigation = (path) => {
    router.push(path);
    closeMobileMenu();
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setShopExpanded(false);
    setPagesExpanded(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setShopExpanded(false);
    setPagesExpanded(false);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const toggleShop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShopExpanded(!shopExpanded);
  };

  const togglePages = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPagesExpanded(!pagesExpanded);
  };

  return (
    <header className="header">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="container">
          <div className="top-bar-content">
            <div className="top-bar-left">
              <span>📞 Order Online Call Us +1 (555) 123-4567</span>
            </div>
            <div className="top-bar-right">
              <Link href="/contact" className="find-store">📍 Find a Store</Link>
              <Link href="/contact" className="email">✉ info@tagace.com</Link>
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
                <Image 
                  src="/logo.jpeg" 
                  alt="Arome Perfume Shop" 
                  width={150}
                  height={40}
                  className="logo-img"
                  style={{ height: '40px', width: 'auto' }}
                />
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
                <span className="cart-count">{getCartItemsCount()}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`} onClick={closeMobileMenu}>
        <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
          <div className="mobile-menu-header">
            <div className="logo">
              <Image 
                src="/logo.jpeg" 
                alt="Arome Perfume Shop" 
                width={120}
                height={35}
                style={{ height: '35px', width: 'auto' }}
              />
            </div>
            <button className="close-btn" onClick={closeMobileMenu}>✕</button>
          </div>
          
          <nav className="mobile-nav">
            {/* HOME */}
            <div className="nav-item">
              <button 
                className="nav-link nav-button" 
                onClick={() => handleNavigation('/')}
              >
                HOME
              </button>
            </div>
            
            {/* SHOP */}
            <div className="nav-item">
              <span className="nav-link">SHOP</span>
              <button className="expand-btn" onClick={toggleShop}>
                {shopExpanded ? '−' : '+'}
              </button>
            </div>
            
            {shopExpanded && (
              <div className="mobile-submenu">
                <div className="submenu-items">
                  <button 
                    className="submenu-link"
                    onClick={() => handleNavigation('/shop')}
                  >
                    All Products
                  </button>
                  <button 
                    className="submenu-link"
                    onClick={() => handleNavigation('/shop/men')}
                  >
                    Men
                  </button>
                  <button 
                    className="submenu-link"
                    onClick={() => handleNavigation('/shop/women')}
                  >
                    Women
                  </button>
                  <button 
                    className="submenu-link"
                    onClick={() => handleNavigation('/shop/unisex')}
                  >
                    Unisex
                  </button>
                </div>
              </div>
            )}
            
            {/* BLOG */}
            <div className="nav-item">
              <button 
                className="nav-link nav-button" 
                onClick={() => handleNavigation('/blog')}
              >
                BLOG
              </button>
            </div>
            
            {/* PAGES */}
            <div className="nav-item">
              <span className="nav-link">PAGES</span>
              <button className="expand-btn" onClick={togglePages}>
                {pagesExpanded ? '−' : '+'}
              </button>
            </div>
            
            {pagesExpanded && (
              <div className="mobile-submenu">
                <div className="submenu-items">
                  <button 
                    className="submenu-link"
                    onClick={() => handleNavigation('/about')}
                  >
                    About Us
                  </button>
                  <button 
                    className="submenu-link"
                    onClick={() => handleNavigation('/faq')}
                  >
                    FAQ Page
                  </button>
                  <button 
                    className="submenu-link"
                    onClick={() => handleNavigation('/contact')}
                  >
                    Contact Us
                  </button>
                  <button 
                    className="submenu-link"
                    onClick={() => handleNavigation('/wishlist')}
                  >
                    Wishlist Page
                  </button>
                  <button 
                    className="submenu-link"
                    onClick={() => handleNavigation('/terms')}
                  >
                    Terms & Conditions
                  </button>
                  <button 
                    className="submenu-link"
                    onClick={() => handleNavigation('/privacy')}
                  >
                    Privacy Policy
                  </button>
                  <button 
                    className="submenu-link"
                    onClick={() => handleNavigation('/size-guide')}
                  >
                    Size Guide
                  </button>
                  <button 
                    className="submenu-link"
                    onClick={() => handleNavigation('/404')}
                  >
                    404 Error Page
                  </button>
                </div>
              </div>
            )}
            
            {/* CONTACT */}
            <div className="nav-item">
              <button 
                className="nav-link nav-button" 
                onClick={() => handleNavigation('/contact')}
              >
                CONTACT
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className={`cart-overlay ${isCartOpen ? 'active' : ''}`}>
        <div className="cart-sidebar">
          <div className="cart-header">
            <h3>{cartItems.length > 0 ? 'Shopping Cart' : 'Shopping Cart'}</h3>
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
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="item-image">
                      <Image 
                        src="/1_08ff09db-b9b0-4781-8774-8c5872176160_360x.webp"
                        alt={item.name} 
                        width={60} 
                        height={60}
                      />
                    </div>
                    <div className="item-details">
                      <div className="item-brand">AROME</div>
                      <div className="item-name">{item.name}</div>
                      <div className="item-price">
                        {typeof item.price === 'string' 
                          ? item.price 
                          : `$${(item.price || 0).toFixed(2)}`
                        }
                      </div>
                      <div className="item-controls">
                        <button 
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="qty">{item.quantity}</span>
                        <button 
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                        <button 
                          className="remove-btn"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Remove
                        </button>
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
                  <span>${(getCartTotal() || 0).toFixed(2)} USD</span>
                </div>
              </div>
              <div className="cart-buttons">
                <Link href="/cart" onClick={toggleCart}>
                  <button className="view-cart-btn">VIEW CART</button>
                </Link>
                <Link href="/checkout" onClick={toggleCart}>
                  <button className="checkout-btn">CHECK OUT</button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}