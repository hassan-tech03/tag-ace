'use client';

import { useEffect } from 'react';
import Image from 'next/image';

const AddToCartModal = ({ isOpen, onClose, product, quantity }) => {
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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Auto close after 3 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="add-to-cart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="success-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
          </div>
          <h3>Added to Cart!</h3>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="modal-content">
          <div className="product-info">
            <div className="product-image">
              <Image
                src="/1_08ff09db-b9b0-4781-8774-8c5872176160_360x.webp"
                alt={product.name}
                width={80}
                height={80}
              />
            </div>
            <div className="product-details">
              <h4>{product.name}</h4>
              <p className="product-category">{product.category || 'Perfume'}</p>
              <div className="quantity-price">
                <span className="quantity">Qty: {quantity}</span>
                <span className="price">
                  {typeof product.price === 'string' 
                    ? product.price 
                    : `$${(product.price || 0).toFixed(2)}`
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-actions">
          <button className="continue-shopping" onClick={onClose}>
            Continue Shopping
          </button>
          <button className="view-cart" onClick={() => {
            onClose();
            window.location.href = '/cart';
          }}>
            View Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToCartModal;