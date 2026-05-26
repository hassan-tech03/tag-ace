'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useCartContext } from '../../context/CartContext';

// Modern product card with:
//  - Consistent square media area with subtle hover image swap
//  - Discount % chip when an originalPrice is present
//  - Status + custom badge stacking (no overlap)
//  - Single-action "Quick Add" CTA that slides up on hover (always visible
//    on touch via CSS)
//  - Star rating with optional review count
//  - Out-of-stock dim treatment
//  - Works equally with hardcoded fallback data (string prices) and live
//    DB products (numeric prices, real images, ratings, etc.)

function parsePrice(val) {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const m = val.match(/[\d.]+/);
    return m ? parseFloat(m[0]) : 0;
  }
  return 0;
}

function formatPrice(val) {
  // If the value came in as a string with extra words like "From $79.00"
  // we keep the original string so the card still reads naturally.
  if (typeof val === 'string') return val;
  const n = parsePrice(val);
  return `$${n.toFixed(2)}`;
}

function discountPercent(price, originalPrice) {
  const p = parsePrice(price);
  const op = parsePrice(originalPrice);
  if (!op || op <= p) return 0;
  return Math.round(((op - p) / op) * 100);
}

function Stars({ rating = 5 }) {
  const r = Math.max(0, Math.min(5, Math.round(Number(rating) || 5)));
  return (
    <span className="stars" aria-label={`${r} out of 5 stars`}>
      <span className="stars-filled">{'★'.repeat(r)}</span>
      <span className="stars-empty">{'★'.repeat(5 - r)}</span>
    </span>
  );
}

const ProductCard = ({ product, className = '' }) => {
  const { addToCart } = useCartContext();

  if (!product) return null;
  const isOutOfStock = product.availability === 'out-of-stock';
  const discount = discountPercent(product.price, product.originalPrice);
  const reviewCount = Number(product.reviewCount || 0);
  const eyebrow =
    product.fragranceFamily ||
    (product.brand ? product.brand : product.gender ? product.gender : '');

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);

    const toast = document.createElement('div');
    toast.className = 'cart-toast';
    toast.innerHTML = `
      <div class="toast-content">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
        <span>Added to cart</span>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 2000);
  };

  const cardClasses = [
    'product-item',
    'product-card-v2',
    isOutOfStock ? 'is-out' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Link
      href={`/products/${product.id}`}
      className="product-link"
      aria-label={product.name}
    >
      <article className={cardClasses}>
        <div className="product-image">
          {/* Top-left badge stack */}
          <div className="badge-stack">
            {discount > 0 && <span className="discount-chip">-{discount}%</span>}
            {product.badge && !isOutOfStock && (
              <span className="sale-badge">{product.badge}</span>
            )}
          </div>

          <Image
            src={product.image || '/1_08ff09db-b9b0-4781-8774-8c5872176160_360x.webp'}
            alt={product.name}
            width={400}
            height={400}
            className="main-image"
            loading="lazy"
            unoptimized={!!product.image}
          />
          <Image
            src={
              product.hoverImage ||
              product.images?.[1] ||
              product.image ||
              '/3_4a5e3cd4-c4da-4955-a739-3dcdebf6f303_360x.webp'
            }
            alt=""
            aria-hidden="true"
            width={400}
            height={400}
            className="hover-image"
            loading="lazy"
            unoptimized={!!(product.hoverImage || product.images?.[1] || product.image)}
          />

          {isOutOfStock && (
            <div className="out-of-stock-overlay">
              <span>Sold Out</span>
            </div>
          )}

          {/* Quick add CTA slides up on hover / shown on touch via CSS */}
          <div className="quick-add">
            <button
              type="button"
              className="quick-add-btn"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              aria-label={isOutOfStock ? 'Sold out' : `Add ${product.name} to cart`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
            </button>
          </div>
        </div>

        <div className="product-info">
          {eyebrow ? <div className="product-eyebrow">{eyebrow}</div> : null}
          <h3>{product.name}</h3>
          <div className="product-rating">
            <Stars rating={product.rating || 5} />
            {reviewCount > 0 && (
              <span className="rating-count">({reviewCount})</span>
            )}
          </div>
          <div className="product-price">
            <span className="current-price">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="original-price">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ProductCard;
