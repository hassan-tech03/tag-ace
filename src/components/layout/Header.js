'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartContext } from '../../context/CartContext';
import SearchModal from '../ui/SearchModal';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [shopExpanded, setShopExpanded] = useState(false);
  const [pagesExpanded, setPagesExpanded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { cartItems, getCartItemsCount, getCartTotal, updateQuantity, removeFromCart } = useCartContext();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);

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
    <header className={`header${isScrolled ? ' scrolled' : ''}`}>
      {/* Top Bar */}
      <div className="top-bar">
        <div className="container">
          <div className="top-bar-content">
            <div className="top-bar-left">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.38 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.38a16 16 0 0 0 6 6l.95-.93a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>Order Online &nbsp;|&nbsp; +1 (555) 123-4567</span>
            </div>
            <div className="top-bar-right">
              <Link href="/contact" className="top-bar-link">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Find a Store
              </Link>
              <Link href="/contact" className="top-bar-link">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                info@mushk.com
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="main-header">
        <div className="container">
          <div className="header-content">

            {/* Hamburger — mobile only */}
            <button
              className="mobile-menu-btn d-flex d-lg-none"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <span className={isMobileMenuOpen ? 'open' : ''}></span>
              <span className={isMobileMenuOpen ? 'open' : ''}></span>
              <span className={isMobileMenuOpen ? 'open' : ''}></span>
            </button>

            {/* Desktop Navigation — left side */}
            <nav className="desktop-nav d-none d-lg-flex">
              <Link href="/" className="desktop-nav-link">Home</Link>
              <div className="desktop-nav-item has-dropdown">
                <span className="desktop-nav-link">
                  Shop
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6,9 12,15 18,9"/></svg>
                </span>
                <div className="nav-dropdown">
                  <Link href="/shop" className="dropdown-link">All Products</Link>
                  <Link href="/shop/men" className="dropdown-link">Men's Fragrances</Link>
                  <Link href="/shop/women" className="dropdown-link">Women's Fragrances</Link>
                  <Link href="/shop/unisex" className="dropdown-link">Unisex</Link>
                </div>
              </div>
              <Link href="/about" className="desktop-nav-link">About</Link>
              <Link href="/contact" className="desktop-nav-link">Contact</Link>
            </nav>

            {/* Logo — centered */}
            <div className="logo">
              <Link href="/">
                <Image
                  src="/only_icon_bg.png"
                  alt="Mushk Perfumes"
                  width={160}
                  height={45}
                  className="logo-img"
                  style={{ height: '65px', width: 'auto' }}
                  priority
                />
              </Link>
            </div>

            {/* Right Icons */}
            <div className="header-icons">
              <button className="search-box d-none d-md-flex" onClick={openSearch} aria-label="Search">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <span className="search-placeholder">Search fragrances…</span>
              </button>
              <button className="icon-btn d-md-none" onClick={openSearch} aria-label="Search">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </button>
              <button className="icon-btn" aria-label="Wishlist">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              <button className="icon-btn cart-btn" onClick={toggleCart} aria-label="Cart">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                {getCartItemsCount() > 0 && (
                  <span className="cart-count">{getCartItemsCount()}</span>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay${isMobileMenuOpen ? ' active' : ''}`} onClick={closeMobileMenu}>
        <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
          <div className="mobile-menu-header">
            <Image src="/logo.jpeg" alt="Mushk" width={120} height={35} style={{ height: '32px', width: 'auto' }} />
            <button className="mobile-close-btn" onClick={closeMobileMenu} aria-label="Close menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <nav className="mobile-nav">
            <div className="nav-item">
              <button className="nav-link nav-button" onClick={() => handleNavigation('/')}>HOME</button>
            </div>

            <div className="nav-item">
              <span className="nav-link">SHOP</span>
              <button className="expand-btn" onClick={toggleShop} aria-label="Toggle shop">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: shopExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}><polyline points="6,9 12,15 18,9"/></svg>
              </button>
            </div>
            {shopExpanded && (
              <div className="mobile-submenu">
                <div className="submenu-items">
                  <button className="submenu-link" onClick={() => handleNavigation('/shop')}>All Products</button>
                  <button className="submenu-link" onClick={() => handleNavigation('/shop/men')}>Men</button>
                  <button className="submenu-link" onClick={() => handleNavigation('/shop/women')}>Women</button>
                  <button className="submenu-link" onClick={() => handleNavigation('/shop/unisex')}>Unisex</button>
                </div>
              </div>
            )}

            <div className="nav-item">
              <button className="nav-link nav-button" onClick={() => handleNavigation('/about')}>ABOUT</button>
            </div>

            <div className="nav-item">
              <span className="nav-link">PAGES</span>
              <button className="expand-btn" onClick={togglePages} aria-label="Toggle pages">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: pagesExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}><polyline points="6,9 12,15 18,9"/></svg>
              </button>
            </div>
            {pagesExpanded && (
              <div className="mobile-submenu">
                <div className="submenu-items">
                  <button className="submenu-link" onClick={() => handleNavigation('/about')}>About Us</button>
                  <button className="submenu-link" onClick={() => handleNavigation('/contact')}>Contact Us</button>
                  <button className="submenu-link" onClick={() => handleNavigation('/wishlist')}>Wishlist</button>
                  <button className="submenu-link" onClick={() => handleNavigation('/faq')}>FAQ</button>
                </div>
              </div>
            )}

            <div className="nav-item">
              <button className="nav-link nav-button" onClick={() => handleNavigation('/contact')}>CONTACT</button>
            </div>
          </nav>
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={closeSearch} />

      {/* Cart Sidebar */}
      <div className={`cart-overlay${isCartOpen ? ' active' : ''}`} onClick={toggleCart}>
        <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
          <div className="cart-header">
            <h3>Shopping Cart <span className="cart-header-count">({getCartItemsCount()})</span></h3>
            <button className="cart-close-btn" onClick={toggleCart} aria-label="Close cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div className="cart-content">
            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                </div>
                <h4>Your cart is empty</h4>
                <p>Discover our exclusive fragrance collection</p>
                <button className="continue-shopping" onClick={toggleCart}>Continue Shopping</button>
              </div>
            ) : (
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="item-image">
                      <Image src="/1_08ff09db-b9b0-4781-8774-8c5872176160_360x.webp" alt={item.name} width={72} height={72} />
                    </div>
                    <div className="item-details">
                      <div className="item-brand">AROME</div>
                      <div className="item-name">{item.name}</div>
                      <div className="item-price">
                        {typeof item.price === 'string' ? item.price : `$${(item.price || 0).toFixed(2)}`}
                      </div>
                      <div className="item-controls">
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                        <span className="qty">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                        <button className="remove-btn" onClick={() => removeFromCart(item.id)}>Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="cart-footer">
              <div className="cart-total">
                <span>Subtotal</span>
                <span className="total-amount">${(getCartTotal() || 0).toFixed(2)} USD</span>
              </div>
              <p className="cart-note">Shipping &amp; taxes calculated at checkout</p>
              <div className="cart-buttons">
                <Link href="/cart" onClick={toggleCart}>
                  <button className="view-cart-btn">VIEW CART</button>
                </Link>
                <Link href="/checkout" onClick={toggleCart}>
                  <button className="checkout-btn">CHECKOUT</button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
