'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useCartContext } from '../../context/CartContext';
import { formatPrice as formatPKR } from "@/lib/money";
import { imageUrl } from "@/lib/images";
import { SHOW_PRODUCT_RATINGS } from '@/lib/storefront/flags';

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
  // If the value came in as a string with extra words like "From Rs 7,900"
  // we keep the original string so the card still reads naturally.
  if (typeof val === 'string') return val;
  return formatPKR(parsePrice(val));
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
    const res = addToCart(product, 1);
    showToast(res?.capped ? `Only ${res.max} in stock` : 'Added to cart');
  };

  const href = `/products/${product.slug || product.id}`;
  const mainImage = product.image || FALLBACK_IMAGE;
  const secondImage = product.hoverImage || product.images?.[1] || '';

  const cardClasses = [
    'product-item',
    'product-card-v2',
    isOutOfStock ? 'is-out' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Whole card (image + text) opens the product; Add to Cart is its own
  // button below, so a tap on the photo never adds to the cart by accident.
  return (
    <article className={cardClasses}>
      <Link href={href} className="product-link">
        <div className="product-image">
          <div className="badge-stack">
            {isOutOfStock ? (
              <span className="soldout-chip">Sold out</span>
            ) : (
              <>
                {discount > 0 && <span className="discount-chip">-{discount}%</span>}
                {product.badge && <span className="sale-badge">{product.badge}</span>}
              </>
            )}
          </div>

          <Image
            src={imageUrl(mainImage, 600)}
            alt={product.name}
            width={400}
            height={400}
            className="main-image"
            loading="lazy"
            unoptimized={/^https?:/.test(mainImage)}
          />
          {secondImage && secondImage !== mainImage && (
            <Image
              src={imageUrl(secondImage, 600)}
              alt={`${product.name}, another view`}
              width={400}
              height={400}
              className="hover-image"
              loading="lazy"
              unoptimized={/^https?:/.test(secondImage)}
            />
          )}
        </div>

        <div className="product-info">
          {eyebrow ? <div className="product-eyebrow">{eyebrow}</div> : null}
          <h3>{product.name}</h3>
          {SHOW_PRODUCT_RATINGS && (
            <div className="product-rating">
              <Stars rating={product.rating || 5} />
              {reviewCount > 0 && (
                <span className="rating-count">({reviewCount})</span>
              )}
            </div>
          )}
          <div className="product-price">
            <span className="current-price">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="original-price">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="card-actions">
        <button
          type="button"
          className="card-add-btn"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          aria-label={isOutOfStock ? `${product.name} is sold out` : `Add ${product.name} to cart`}
        >
          {isOutOfStock ? (
            <span>Sold out</span>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span>Add to cart</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
};

const FALLBACK_IMAGE = '/brand/mushk-icon.png';

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'cart-toast';
  toast.setAttribute('role', 'status');
  toast.innerHTML = `
    <div class="toast-content">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20,6 9,17 4,12"></polyline>
      </svg>
      <span></span>
    </div>
  `;
  toast.querySelector('span').textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 50);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

export default ProductCard;
