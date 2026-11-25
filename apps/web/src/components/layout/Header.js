'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCartContext } from '../../context/CartContext';
import SearchModal from '../ui/SearchModal';
import { formatPrice } from "@/lib/money";
import { imageUrl } from "@/lib/images";
import { useDialog } from "@/hooks/useDialog";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [shopExpanded, setShopExpanded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  // Contact details from Admin → Site Content (/api/storefront/settings).
  // Nothing is shown for a field until it has been filled in there.
  const [contact, setContact] = useState({ phone: '', email: '' });
  const { cartItems, getCartItemsCount, getCartTotal, updateQuantity, removeFromCart } = useCartContext();
  const router = useRouter();
  const cartRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/storefront/settings', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((b) => {
        if (cancelled || !b?.storeInfo) return;
        setContact({
          phone: b.storeInfo.phone || '',
          email: b.storeInfo.email || '',
        });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const handleNavigation = (path) => {
    router.push(path);
    closeMobileMenu();
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setShopExpanded(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setShopExpanded(false);
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const closeCart = () => setIsCartOpen(false);
  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);

  // Scroll lock, Escape to close, focus trap for both drawers.
  useDialog(isCartOpen, closeCart, cartRef);
  useDialog(isMobileMenuOpen, closeMobileMenu, menuRef);

  const whatsappHref = contact.phone
    ? `https://wa.me/92${contact.phone.replace(/\D/g, '').replace(/^0/, '')}`
    : '';

  const toggleShop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShopExpanded(!shopExpanded);
  };

  return (
    <header className={`header${isScrolled ? ' scrolled' : ''}`}>
      {/* Top Bar */}
      <div className="top-bar">
        <div className="container">
          <div className="top-bar-content">
            <div className="top-bar-left">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.38 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.38a16 16 0 0 0 6 6l.95-.93a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>
                Order online &nbsp;·&nbsp; Cash on Delivery available
                {contact.phone ? <>&nbsp;|&nbsp; <a href={`tel:${contact.phone.replace(/[^+0-9]/g, '')}`} className="top-bar-phone">{contact.phone}</a></> : null}
              </span>
            </div>
            <div className="top-bar-right">
              {contact.email ? (
                <a href={`mailto:${contact.email}`} className="top-bar-link">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  {contact.email}
                </a>
              ) : (
                <Link href="/contact" className="top-bar-link">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  Contact us
                </Link>
              )}
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
                <Link href="/shop" className="desktop-nav-link" aria-haspopup="true">
                  Shop
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="6,9 12,15 18,9"/></svg>
                </Link>
                <div className="nav-dropdown">
                  <Link href="/shop" className="dropdown-link">All Products</Link>
                  <Link href="/shop/men" className="dropdown-link">Men's Fragrances</Link>
                  <Link href="/shop/women" className="dropdown-link">Women's Fragrances</Link>
                </div>
              </div>
              <Link href="/blog" className="desktop-nav-link">Blog</Link>
              <Link href="/about" className="desktop-nav-link">About</Link>
              <Link href="/contact" className="desktop-nav-link">Contact</Link>
            </nav>

            {/* Logo — centered */}
            <div className="logo">
              <Link href="/">
                <Image
                  src="/brand/mushk-icon.png"
                  alt="Mushk Perfumes"
                  width={314}
                  height={312}
                  className="logo-img"
                  style={{ height: '54px', width: 'auto' }}
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
      <div
        className={`mobile-menu-overlay${isMobileMenuOpen ? ' active' : ''}`}
        onClick={closeMobileMenu}
        inert={isMobileMenuOpen ? undefined : ''}
      >
        <div
          className="mobile-menu"
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mobile-menu-header">
            <Image src="/brand/mushk-logo.png" alt="Mushk Perfumes" width={379} height={339} style={{ height: '52px', width: 'auto' }} />
            <button className="mobile-close-btn" onClick={closeMobileMenu} aria-label="Close menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <nav className="mobile-nav">
            <div className="nav-item">
              <button className="nav-link nav-button" onClick={() => handleNavigation('/')}>HOME</button>
            </div>

            <div className="nav-item">
              <button
                className="nav-link nav-button nav-toggle"
                onClick={toggleShop}
                aria-expanded={shopExpanded}
                aria-controls="mobile-shop-submenu"
              >
                <span>SHOP</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" style={{ transform: shopExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}><polyline points="6,9 12,15 18,9"/></svg>
              </button>
            </div>
            {shopExpanded && (
              <div className="mobile-submenu" id="mobile-shop-submenu">
                <div className="submenu-items">
                  <button className="submenu-link" onClick={() => handleNavigation('/shop')}>All Products</button>
                  <button className="submenu-link" onClick={() => handleNavigation('/shop/men')}>Men&apos;s Fragrances</button>
                  <button className="submenu-link" onClick={() => handleNavigation('/shop/women')}>Women&apos;s Fragrances</button>
                </div>
              </div>
            )}

            <div className="nav-item">
              <button className="nav-link nav-button" onClick={() => handleNavigation('/blog')}>BLOG</button>
            </div>

            <div className="nav-item">
              <button className="nav-link nav-button" onClick={() => handleNavigation('/about')}>ABOUT</button>
            </div>


            <div className="nav-item">
              <button className="nav-link nav-button" onClick={() => handleNavigation('/faq')}>FAQS</button>
            </div>

            <div className="nav-item">
              <button className="nav-link nav-button" onClick={() => handleNavigation('/contact')}>CONTACT</button>
            </div>
          </nav>

          {/* Quick actions: search, cart, contact */}
          <div className="mobile-menu-actions">
            <button type="button" className="mobile-action" onClick={() => { closeMobileMenu(); openSearch(); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <span>Search fragrances</span>
            </button>
            <button type="button" className="mobile-action" onClick={() => { closeMobileMenu(); setIsCartOpen(true); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <span>Cart ({getCartItemsCount()})</span>
            </button>
            {whatsappHref && (
              <a className="mobile-action" href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                <span>WhatsApp {contact.phone}</span>
              </a>
            )}
            {contact.phone && (
              <a className="mobile-action" href={`tel:${contact.phone.replace(/[^+0-9]/g, '')}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.38 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.38a16 16 0 0 0 6 6l.95-.93a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>Call us</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={closeSearch} />

      {/* Cart Sidebar */}
      <div
        className={`cart-overlay${isCartOpen ? ' active' : ''}`}
        onClick={closeCart}
        inert={isCartOpen ? undefined : ''}
      >
        <div
          className="cart-sidebar"
          ref={cartRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-drawer-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="cart-header">
            <h2 id="cart-drawer-title" className="cart-drawer-title">Shopping Cart <span className="cart-header-count">({getCartItemsCount()})</span></h2>
            <button className="cart-close-btn" onClick={closeCart} aria-label="Close cart">
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
                <p className="empty-cart-title">Your cart is empty</p>
                <p>Discover our exclusive fragrance collection</p>
                <button className="continue-shopping" onClick={closeCart}>Continue Shopping</button>
              </div>
            ) : (
              <div className="cart-items">
                {cartItems.map((item) => {
                  const itemImg =
                    item.image ||
                    item.images?.[0] ||
                    '/1_08ff09db-b9b0-4781-8774-8c5872176160_360x.webp';
                  const isAbsolute = /^https?:\/\//i.test(itemImg);
                  return (
                    <div key={item.id} className="cart-item">
                      <div className="item-image">
                        <Image
                          src={imageUrl(itemImg, 160)}
                          alt={item.name}
                          width={72}
                          height={72}
                          unoptimized={isAbsolute}
                        />
                      </div>
                      <div className="item-details">
                        <div className="item-brand">{(item.brand || 'MUSHK').toUpperCase()}</div>
                        <div className="item-name">{item.name}</div>
                        <div className="item-price">
                          {typeof item.price === 'string' ? item.price : formatPrice((item.price || 0))}
                        </div>
                        <div className="item-controls">
                          <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={`Decrease ${item.name} quantity`}>−</button>
                          <span className="qty">{item.quantity}</span>
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={Number(item.stock) > 0 && item.quantity >= Number(item.stock)}
                            aria-label={`Increase ${item.name} quantity`}
                          >+</button>
                          <button className="remove-btn" onClick={() => removeFromCart(item.id)}>Remove</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="cart-footer">
              <div className="cart-total">
                <span>Subtotal</span>
                <span className="total-amount">{formatPrice((getCartTotal() || 0))}</span>
              </div>
              <p className="cart-note">Shipping &amp; taxes calculated at checkout</p>
              <div className="cart-buttons">
                <Link href="/cart" onClick={closeCart}>
                  <button className="view-cart-btn">VIEW CART</button>
                </Link>
                <Link href="/checkout" onClick={closeCart}>
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
