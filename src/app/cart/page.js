'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartContext } from '../../context/CartContext';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCartContext();
  const [orderInstructions, setOrderInstructions] = useState('');

  // Helper function to extract numeric price from string or number
  const getNumericPrice = (price) => {
    if (typeof price === 'number') {
      return price;
    }
    if (typeof price === 'string') {
      // Extract number from strings like "$45.00", "From $79.00", etc.
      const match = price.match(/[\d.]+/);
      return match ? parseFloat(match[0]) : 0;
    }
    return 0;
  };

  const subtotal = getCartTotal() || 0;

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        {/* Header */}
        <div className="cart-header">
          <div className="container">
            <nav className="breadcrumb">
              <Link href="/">Home</Link>
              <span>/</span>
              <span>Your Shopping Cart</span>
            </nav>
          </div>
        </div>

        <div className="container py-5">
          <div className="empty-cart">
            <div className="empty-cart-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </div>
            <h2>Your Cart is Empty</h2>
            <p>Add some products to get started!</p>
            <div className="empty-cart-actions">
              <Link href="/shop" className="continue-shopping-btn">
                Continue Shopping
              </Link>
              <Link href="/contact" className="contact-help-btn">
                Need Help? Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      {/* Header */}
      <div className="cart-header">
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>Your Shopping Cart</span>
          </nav>
        </div>
      </div>

      {/* Cart Content */}
      <div className="cart-content">
        <div className="container">
          <div className="cart-table-container">
            {/* Table Header */}
            <div className="cart-table-header">
              <div className="header-product">PRODUCT</div>
              <div className="header-quantity">QUANTITY</div>
              <div className="header-total">TOTAL</div>
            </div>

            {/* Cart Items */}
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-product">
                    <div className="product-image">
                      <Image
                        src="/1_08ff09db-b9b0-4781-8774-8c5872176160_360x.webp"
                        alt={item.name}
                        width={80}
                        height={80}
                      />
                    </div>
                    <div className="product-details">
                      <h4 className="product-brand">AROME</h4>
                      <h3 className="product-name">{item.name}</h3>
                      <div className="product-specs">
                        <span>Category: {item.category || 'Perfume'}</span>
                        <span>Size: 100ML</span>
                      </div>
                    </div>
                  </div>

                  <div className="item-quantity">
                    <div className="quantity-controls">
                      <button 
                        className="qty-btn minus"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="qty-display">{item.quantity}</span>
                      <button 
                        className="qty-btn plus"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button 
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                      </svg>
                    </button>
                  </div>

                  <div className="item-total">
                    ${(getNumericPrice(item.price) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="cart-bottom">
            <div className="cart-actions">
              <div className="order-instructions">
                <label htmlFor="instructions">Order special instructions</label>
                <textarea
                  id="instructions"
                  value={orderInstructions}
                  onChange={(e) => setOrderInstructions(e.target.value)}
                  placeholder="Add any special instructions for your order..."
                />
              </div>
            </div>

            <div className="cart-summary">
              <div className="summary-content">
                <div className="subtotal-row">
                  <span className="subtotal-label">Subtotal</span>
                  <span className="subtotal-amount">${subtotal.toFixed(2)} USD</span>
                </div>
                <p className="shipping-note">Taxes and shipping calculated at checkout.</p>
                <Link href="/checkout">
                  <button className="checkout-btn">CHECK OUT</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}