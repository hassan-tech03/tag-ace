'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useCartContext } from '../../context/CartContext';

const ProductCard = ({ product, showActions = true, className = "" }) => {
  const { addToCart } = useCartContext();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.availability !== 'out-of-stock') {
      addToCart(product, 1);
      
      // Create a toast notification
      const toast = document.createElement('div');
      toast.className = 'cart-toast';
      toast.innerHTML = `
        <div class="toast-content">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>
          <span>Added to cart!</span>
        </div>
      `;
      document.body.appendChild(toast);
      
      // Animate in
      setTimeout(() => toast.classList.add('show'), 100);
      
      // Remove after 2 seconds
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
      }, 2000);
    }
  };

  return (
    <Link 
      href={`/products/${product.id}`} 
      className="product-link"
    >
      <div className={`product-item ${className}`}>
        <div className="product-image">
          {product.badge && <span className="sale-badge">{product.badge}</span>}
          {product.availability === 'out-of-stock' && <span className="out-of-stock-badge">Out of Stock</span>}
          
          <Image
            src="/1_08ff09db-b9b0-4781-8774-8c5872176160_360x.webp"
            alt={product.name}
            width={300}
            height={300}
            className="main-image"
            priority={false}
            loading="lazy"
          />
          <Image
            src="/3_4a5e3cd4-c4da-4955-a739-3dcdebf6f303_360x.webp"
            alt={`${product.name} Hover`}
            width={300}
            height={300}
            className="hover-image"
            priority={false}
            loading="lazy"
          />

          {showActions && (
            <div className="product-actions">
              <button className="action-btn" onClick={(e) => e.preventDefault()}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
              <button className="action-btn" onClick={(e) => e.preventDefault()}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
              <button className="action-btn" disabled={product.availability === 'out-of-stock'} onClick={handleAddToCart}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className="product-info">
          <div className="product-rating">
            <span>★★★★★</span>
          </div>
          
          <h3>{product.name}</h3>
          
          <div className="product-price">
            <span className="current-price">
              {typeof product.price === 'string' 
                ? product.price 
                : `$${(product.price || 0).toFixed(2)}`
              }
            </span>
            {product.originalPrice && (
              <span className="original-price">
                {typeof product.originalPrice === 'string' 
                  ? product.originalPrice 
                  : `$${(product.originalPrice || 0).toFixed(2)}`
                }
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;