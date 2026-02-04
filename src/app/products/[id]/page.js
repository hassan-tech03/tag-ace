'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartContext } from '../../../context/CartContext';
import { useRouter } from 'next/navigation';
import AddToCartModal from '../../../components/ui/AddToCartModal';

// Mock data - replace with actual data fetching
const getProduct = (id) => {
  // Convert id to string to match URL params
  const productId = String(id);
  
  console.log('Looking for product with ID:', productId, 'Type:', typeof productId);
  
  // Generate products dynamically for any ID
  const generateProduct = (id) => {
    const productNames = [
      'Love Edition For Her', 'Rose Elegance', 'Floral Dreams', 'Feminine Touch', 'Lady Charm', 'Elegant Rose', 'Sweet Blossom', 'Royal Lady',
      'Arome Le Parfum', 'Masculine Power', 'Strong Essence', 'Bold Spirit', 'Urban Legend', 'Classic Man', 'Wild Adventure', 'Executive Choice',
      'Little Angel', 'Sweet Dreams', 'Playful Scent', 'Gentle Touch', 'Happy Kids', 'Soft Breeze', 'Innocent Joy', 'Pure Delight',
      'Signature Scent', 'Midnight Rose', 'Ocean Breeze', 'Golden Hour', 'Velvet Dreams', 'Crystal Clear', 'Royal Essence', 'Pure Elegance',
      'Universal Scent', 'Neutral Essence', 'Pure Balance', 'Harmony Blend', 'Fresh Unity', 'Balanced Touch', 'Modern Blend', 'Timeless Harmony'
    ];
    
    const categories = ['Women', 'Men', 'Unisex'];
    const badges = ['New', 'Sale', 'Popular', 'Limited', null, null]; // More null values for no badge
    const descriptions = [
      'A captivating fragrance that embodies elegance and sophistication with floral and woody notes.',
      'An intense and powerful scent designed for confidence with spicy and amber undertones.',
      'A fresh and modern fragrance perfect for daily wear with citrus and clean notes.',
      'A luxurious blend of premium ingredients creating a unique and memorable scent.',
      'An elegant composition featuring delicate florals with a hint of vanilla and musk.',
      'A bold and dynamic fragrance with woody base notes and fresh top notes.',
      'A sophisticated scent that makes a lasting impression with its complex blend.',
      'A versatile fragrance suitable for any occasion with balanced and harmonious notes.'
    ];
    
    const numId = parseInt(id);
    const nameIndex = (numId - 1) % productNames.length;
    const categoryIndex = Math.floor((numId - 1) / 13) % categories.length;
    const badgeIndex = numId % badges.length;
    const descIndex = (numId - 1) % descriptions.length;
    
    const basePrice = 45 + (numId % 8) * 10; // Prices between $45-$115
    const hasOriginalPrice = numId % 4 === 0; // Every 4th product has original price
    const originalPrice = hasOriginalPrice ? basePrice + 20 : null;
    const finalPrice = hasOriginalPrice ? basePrice : basePrice;
    
    return {
      id: numId,
      name: productNames[nameIndex],
      price: finalPrice,
      originalPrice: originalPrice,
      rating: 4 + (numId % 2), // Rating 4 or 5
      reviews: 15 + (numId % 30), // Reviews between 15-44
      description: descriptions[descIndex],
      images: [
        '/1_08ff09db-b9b0-4781-8774-8c5872176160_360x.webp',
        '/3_4a5e3cd4-c4da-4955-a739-3dcdebf6f303_360x.webp',
        '/259.webp',
        '/11.webp'
      ],
      badge: badges[badgeIndex],
      category: categories[categoryIndex]
    };
  };
  
  // Check if it's a valid number
  const numId = parseInt(productId);
  if (isNaN(numId) || numId < 1) {
    console.log('Invalid product ID:', productId);
    return null;
  }
  
  // Generate product for any valid ID
  const product = generateProduct(numId);
  console.log('Generated product:', product.name);
  
  return product;
};

export default function ProductDetail({ params }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [resolvedParams, setResolvedParams] = useState(null);
  const [product, setProduct] = useState(null);
  const [reviewFilter, setReviewFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Most helpful');
  const [likedReviews, setLikedReviews] = useState(new Set());
  const [openFAQ, setOpenFAQ] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { addToCart } = useCartContext();
  const router = useRouter();
  
  // Resolve params and get product
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolved = await params;
        console.log('Resolved params:', resolved);
        setResolvedParams(resolved);
        
        if (resolved?.id) {
          const foundProduct = getProduct(resolved.id);
          console.log('Found product:', foundProduct);
          setProduct(foundProduct);
        }
      } catch (error) {
        console.error('Error resolving params:', error);
        // Fallback for older Next.js versions
        if (params && typeof params === 'object' && params.id) {
          console.log('Using fallback params:', params);
          setResolvedParams(params);
          const foundProduct = getProduct(params.id);
          console.log('Found product (fallback):', foundProduct);
          setProduct(foundProduct);
        }
      }
    };
    
    resolveParams();
  }, [params]);

  // Load GLightbox
  useEffect(() => {
    const loadGLightbox = async () => {
      if (typeof window !== 'undefined') {
        try {
          const GLightbox = (await import('glightbox')).default;
          await import('glightbox/dist/css/glightbox.min.css');
          
          GLightbox({
            selector: '.glightbox',
            touchNavigation: true,
            loop: true,
            autoplayVideos: true
          });
        } catch (error) {
          console.error('Error loading GLightbox:', error);
        }
      }
    };
    
    if (product) {
      loadGLightbox();
    }
  }, [product]);
  
  // Loading state
  if (!resolvedParams) {
    return (
      <div className="product-detail-page">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-6 text-center">
              <div className="loading-content" style={{ padding: '60px 20px' }}>
                <div className="loading-spinner mb-4" style={{
                  width: '60px',
                  height: '60px',
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid #8B5A7C',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto'
                }}></div>
                <h2 style={{ fontSize: '1.5rem', color: '#2C3E50', marginBottom: '15px', fontFamily: 'Playfair Display, serif' }}>
                  Loading Product...
                </h2>
                <p style={{ color: '#666', fontSize: '1rem' }}>
                  Please wait while we load the product details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-6 text-center">
              <div className="error-content" style={{ padding: '60px 20px' }}>
                <div className="error-icon mb-4">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: '#8B5A7C' }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                </div>
                <h1 style={{ fontSize: '2rem', color: '#2C3E50', marginBottom: '20px', fontFamily: 'Playfair Display, serif' }}>
                  Product Not Found
                </h1>
                <p style={{ color: '#666', marginBottom: '30px', fontSize: '1.1rem' }}>
                  The product you&apos;re looking for doesn&apos;t exist or may have been removed.
                </p>
                <div className="error-actions">
                  <Link 
                    href="/shop" 
                    style={{
                      background: '#8B5A7C',
                      color: 'white',
                      padding: '12px 30px',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      transition: 'all 0.3s ease',
                      display: 'inline-block',
                      marginRight: '15px'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#6B4C57'}
                    onMouseOut={(e) => e.target.style.background = '#8B5A7C'}
                  >
                    Back to Shop
                  </Link>
                  <Link 
                    href="/" 
                    style={{
                      background: 'transparent',
                      color: '#8B5A7C',
                      padding: '12px 30px',
                      textDecoration: 'none',
                      border: '2px solid #8B5A7C',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      transition: 'all 0.3s ease',
                      display: 'inline-block'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = '#8B5A7C';
                      e.target.style.color = 'white';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#8B5A7C';
                    }}
                  >
                    Go Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Generate customer reviews for the product
  const generateReviews = (productId, reviewCount) => {
    const reviewers = [
      'Sarah Johnson', 'Michael Chen', 'Emma Wilson', 'David Rodriguez', 'Lisa Thompson',
      'James Miller', 'Anna Garcia', 'Robert Taylor', 'Maria Martinez', 'John Anderson',
      'Jessica Brown', 'William Jones', 'Ashley Davis', 'Christopher Wilson', 'Amanda Moore',
      'Daniel Jackson', 'Stephanie White', 'Matthew Harris', 'Jennifer Clark', 'Ryan Lewis'
    ];
    
    const reviewTexts = [
      'I would buy again For Her. It\'s a Nice product.',
      'Best Product. I like this perfume so much.',
      'Amazing fragrance! Long-lasting and beautiful scent.',
      'Perfect for daily wear. Great quality and value.',
      'Love the packaging and the scent is incredible.',
      'Excellent product, highly recommend to everyone.',
      'Beautiful fragrance, gets compliments all the time.',
      'Great quality perfume, worth every penny.',
      'Lovely scent that lasts throughout the day.',
      'Perfect gift for someone special.',
      'Outstanding fragrance with amazing longevity.',
      'Sophisticated scent, perfect for evening wear.',
      'Fresh and clean fragrance, love it!',
      'Elegant and classy perfume, very impressed.',
      'Unique scent that stands out from others.',
      'Great value for money, will definitely repurchase.',
      'Beautiful bottle design and amazing fragrance.',
      'Perfect balance of floral and woody notes.',
      'Long-lasting fragrance that doesn\'t fade.',
      'Absolutely love this perfume, my new favorite!'
    ];
    
    const reviews = [];
    for (let i = 0; i < reviewCount; i++) {
      const reviewerIndex = (productId + i) % reviewers.length;
      const textIndex = (productId + i) % reviewTexts.length;
      const rating = 3 + (i % 3); // Mix of 3, 4, and 5 star ratings
      const daysAgo = Math.floor(Math.random() * 90) + 1; // 1-90 days ago
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      
      reviews.push({
        id: i + 1,
        name: reviewers[reviewerIndex],
        rating: rating,
        text: reviewTexts[textIndex],
        date: date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit' 
        }),
        helpful: Math.floor(Math.random() * 10) + 1,
        verified: true
      });
    }
    
    return reviews;
  };

  // Filter and sort reviews
  const filterAndSortReviews = (reviews) => {
    let filteredReviews = [...reviews];
    
    // Filter by rating
    if (reviewFilter !== 'All') {
      const rating = parseInt(reviewFilter.replace('★ ', ''));
      filteredReviews = filteredReviews.filter(review => review.rating === rating);
    }
    
    // Sort reviews
    switch (sortBy) {
      case 'Newest':
        filteredReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'Oldest':
        filteredReviews.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'Highest rating':
        filteredReviews.sort((a, b) => b.rating - a.rating);
        break;
      case 'Lowest rating':
        filteredReviews.sort((a, b) => a.rating - b.rating);
        break;
      case 'Most helpful':
      default:
        filteredReviews.sort((a, b) => b.helpful - a.helpful);
        break;
    }
    
    return filteredReviews;
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setShowModal(true);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, quantity);
      router.push('/cart');
    }
  };

  const handleLikeReview = (reviewId) => {
    setLikedReviews(prev => {
      const newLikedReviews = new Set(prev);
      if (newLikedReviews.has(reviewId)) {
        newLikedReviews.delete(reviewId);
      } else {
        newLikedReviews.add(reviewId);
      }
      return newLikedReviews;
    });
  };

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  // FAQ data
  const faqs = [
    {
      question: "How do I choose the right fragrance for me?",
      answer: "We recommend consulting a fragrance professional to determine which scents or notes best fit your preferences. Consider your lifestyle, the occasions you'll wear it, and scents you naturally gravitate towards."
    },
    {
      question: "Are your fragrances certified and safe to use?",
      answer: "Yes, all our fragrances are certified and meet international safety standards. We use high-quality ingredients and follow strict manufacturing processes to ensure product safety and quality."
    },
    {
      question: "How long does it take to see results from fragrances?",
      answer: "Fragrances provide immediate results upon application. The scent develops over time with top, middle, and base notes revealing themselves throughout the day. Most fragrances last 4-8 hours depending on the concentration and your skin type."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for unopened products. If you're not satisfied with your purchase, you can return it within 30 days for a full refund or exchange."
    },
    {
      question: "How should I store my perfume?",
      answer: "Store your perfume in a cool, dry place away from direct sunlight and heat. Keep the bottle tightly closed and avoid storing in bathrooms where humidity can affect the fragrance quality."
    }
  ];

  return (
    <div className="product-detail-page">
      {/* Breadcrumb */}
      <section className="breadcrumb-section">
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/shop">Shop</Link>
            <span>/</span>
            <span>{product.name}</span>
          </nav>
        </div>
      </section>

      {/* Product Detail */}
      <section className="product-detail-section">
        <div className="container">
          <div className="row">
            {/* Product Images */}
            <div className="col-lg-6">
              <div className="product-images">
                {/* Main Image */}
                <div className="main-image-container">
                  {product.badge && (
                    <span className="product-badge">{product.badge}</span>
                  )}
                  <div className="main-image">
                    <Image
                      src={product.images[selectedImage]}
                      alt={product.name}
                      width={600}
                      height={600}
                      className="img-fluid"
                      priority
                    />
                    {/* Zoom Icon */}
                    <a 
                      href={product.images[selectedImage]} 
                      className="glightbox zoom-icon"
                      data-gallery="product-gallery"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                        <line x1="11" y1="8" x2="11" y2="14"></line>
                        <line x1="8" y1="11" x2="14" y2="11"></line>
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Thumbnail Images */}
                <div className="thumbnail-images">
                  {product.images.map((image, index) => (
                    <div 
                      key={index}
                      className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        width={100}
                        height={100}
                        className="img-fluid"
                      />
                    </div>
                  ))}
                </div>

                {/* Hidden images for lightbox gallery */}
                <div style={{ display: 'none' }}>
                  {product.images.slice(1).map((image, index) => (
                    <a 
                      key={index}
                      href={image} 
                      className="glightbox"
                      data-gallery="product-gallery"
                    ></a>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="col-lg-6">
              <div className="product-info">
                {/* Category */}
                <div className="product-category">
                  <Link href={`/shop/${product.category.toLowerCase()}`}>
                    {product.category}
                  </Link>
                </div>

                {/* Product Name */}
                <h1 className="product-title">{product.name}</h1>

                {/* Rating */}
                <div className="product-rating">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < product.rating ? 'star filled' : 'star'}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="rating-text">({product.reviews} reviews)</span>
                </div>

                {/* Price */}
                <div className="product-price">
                  <span className="current-price">${product.price.toFixed(2)}</span>
                  {product.originalPrice && (
                    <span className="original-price">${product.originalPrice.toFixed(2)}</span>
                  )}
                  {product.originalPrice && (
                    <span className="discount">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  )}
                </div>

                {/* Description */}
                <div className="product-description">
                  <p>{product.description}</p>
                </div>

                {/* Quantity & Add to Cart */}
                <div className="product-purchase-actions">
                  <div className="quantity-selector">
                    <label>Quantity:</label>
                    <div className="quantity-controls">
                      <button 
                        className="qty-btn minus"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        −
                      </button>
                      <span className="qty-display">{quantity}</span>
                      <button 
                        className="qty-btn plus"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="action-buttons">
                    <button 
                      className="btn add-to-cart-btn"
                      onClick={handleAddToCart}
                    >
                      ADD TO CART
                    </button>
                    <button 
                      className="btn buy-now-btn"
                      onClick={handleBuyNow}
                    >
                      BUY IT NOW
                    </button>
                  </div>

                  <div className="wishlist-compare">
                    <button className="wishlist-btn">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                      Add to Wishlist
                    </button>
                  </div>
                </div>

                {/* Product Features */}
                <div className="product-features">
                  <div className="feature">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27,6.96 12,12.01 20.73,6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                    <span>Free shipping on orders over $50</span>
                  </div>
                  <div className="feature">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9,22 9,12 15,12 15,22"></polyline>
                    </svg>
                    <span>30-day return policy</span>
                  </div>
                  <div className="feature">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="3" width="15" height="13"></rect>
                      <polygon points="16,8 20,8 23,11 23,16 16,16 16,8"></polygon>
                      <circle cx="5.5" cy="18.5" r="2.5"></circle>
                      <circle cx="18.5" cy="18.5" r="2.5"></circle>
                    </svg>
                    <span>Fast delivery in 2-3 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="customer-reviews-section">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="reviews-container">
                <h2 className="reviews-title">Customer Reviews</h2>
                
                {/* Reviews Summary */}
                <div className="reviews-summary">
                  <div className="rating-overview">
                    <div className="overall-rating">
                      <span className="rating-number">{product.rating}.0</span>
                      <div className="rating-stars">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < product.rating ? 'star filled' : 'star'}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="review-count">{product.reviews} Reviews</span>
                    </div>
                    
                    <div className="rating-breakdown">
                      <div className="rating-bar">
                        <span className="star-label">5</span>
                        <div className="bar">
                          <div className="fill" style={{ width: '60%' }}></div>
                        </div>
                        <span className="percentage">60%</span>
                      </div>
                      <div className="rating-bar">
                        <span className="star-label">4</span>
                        <div className="bar">
                          <div className="fill" style={{ width: '30%' }}></div>
                        </div>
                        <span className="percentage">30%</span>
                      </div>
                      <div className="rating-bar">
                        <span className="star-label">3</span>
                        <div className="bar">
                          <div className="fill" style={{ width: '10%' }}></div>
                        </div>
                        <span className="percentage">10%</span>
                      </div>
                      <div className="rating-bar">
                        <span className="star-label">2</span>
                        <div className="bar">
                          <div className="fill" style={{ width: '0%' }}></div>
                        </div>
                        <span className="percentage">0%</span>
                      </div>
                      <div className="rating-bar">
                        <span className="star-label">1</span>
                        <div className="bar">
                          <div className="fill" style={{ width: '0%' }}></div>
                        </div>
                        <span className="percentage">0%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="review-actions">
                    <p className="review-prompt">Review this product</p>
                    <p className="review-subtext">Share your thoughts with other customers.</p>
                    <button className="write-review-btn">Write a review</button>
                  </div>
                </div>

                {/* Review Filters */}
                <div className="review-filters">
                  <div className="filter-buttons">
                    {['All', '★ 5', '★ 4', '★ 3', '★ 2', '★ 1'].map((filter) => (
                      <button
                        key={filter}
                        className={`filter-btn ${reviewFilter === filter ? 'active' : ''}`}
                        onClick={() => setReviewFilter(filter)}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                  
                  <div className="sort-dropdown">
                    <label>Sort by</label>
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                      className="sort-select"
                    >
                      <option value="Most helpful">Most helpful</option>
                      <option value="Newest">Newest</option>
                      <option value="Oldest">Oldest</option>
                      <option value="Highest rating">Highest rating</option>
                      <option value="Lowest rating">Lowest rating</option>
                    </select>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="reviews-list">
                  {filterAndSortReviews(generateReviews(product.id, Math.min(product.reviews, 10))).map((review) => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <div className="reviewer-avatar">
                            {review.name.charAt(0)}
                          </div>
                          <div className="reviewer-details">
                            <span className="reviewer-name">{review.name}</span>
                            <div className="review-rating">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < review.rating ? 'star filled' : 'star'}>
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="review-date">
                          Review on {review.date}
                        </div>
                      </div>
                      
                      <div className="review-content">
                        <p className="review-text">{review.text}</p>
                      </div>
                      
                      <div className="review-actions">
                        <button 
                          className={`helpful-btn ${likedReviews.has(review.id) ? 'liked' : ''}`}
                          onClick={() => handleLikeReview(review.id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                          </svg>
                          ({review.helpful + (likedReviews.has(review.id) ? 1 : 0)})
                        </button>
                        <button className="report-btn">Report</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="faqs-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="faqs-content">
                <div className="faqs-header">
                  <p className="faqs-subtitle">FREQUENTLY ASKED QUESTIONS</p>
                  <h2 className="faqs-title">You've Got Any Questions?</h2>
                </div>
                
                <div className="faqs-list">
                  {faqs.map((faq, index) => (
                    <div key={index} className="faq-item">
                      <button 
                        className={`faq-question ${openFAQ === index ? 'active' : ''}`}
                        onClick={() => toggleFAQ(index)}
                      >
                        <span>{faq.question}</span>
                        <svg 
                          width="20" 
                          height="20" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2"
                          className={`faq-icon ${openFAQ === index ? 'rotated' : ''}`}
                        >
                          {openFAQ === index ? (
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          ) : (
                            <>
                              <line x1="12" y1="5" x2="12" y2="19"></line>
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </>
                          )}
                        </svg>
                      </button>
                      
                      <div className={`faq-answer ${openFAQ === index ? 'open' : ''}`}>
                        <div className="faq-answer-content">
                          <p>{faq.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="col-lg-6">
              <div className="faqs-image">
                <Image
                  src="/1_08ff09db-b9b0-4781-8774-8c5872176160_360x.webp"
                  alt="Perfume Application"
                  width={600}
                  height={400}
                  className="img-fluid"
                />
                
                <div className="help-card">
                  <h4>Still Have Questions?</h4>
                  <p>Feel free to ask any questions you have!</p>
                  <button className="help-btn">HERE TO HELP</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add to Cart Modal */}
      <AddToCartModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        product={product}
        quantity={quantity}
      />
    </div>
  );
}