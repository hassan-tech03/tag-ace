'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import ProductCard from '../components/ui/ProductCard';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState('women');
  const [isChanging, setIsChanging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const swiperRef = useRef(null);

  // All product content is driven from the admin dashboard via the
  // /api/storefront/* endpoints. Empty arrays render a polite empty state
  // instead of dummy data.
  const [bestSellers, setBestSellers] = useState({ women: [], men: [], unisex: [] });
  const [popularProducts, setPopularProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [bestSellersLoading, setBestSellersLoading] = useState(true);
  const [popularLoading, setPopularLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      const fetchProducts = (qs) =>
        fetch(`/api/storefront/products?${qs}`, { cache: 'no-store' })
          .then((r) => (r.ok ? r.json() : null))
          .then((b) => (b?.items ? b.items : []))
          .catch(() => []);

      try {
        const [women, men, unisex, popular, reviews] = await Promise.all([
          fetchProducts('category=women&limit=8&sort=-createdAt'),
          fetchProducts('category=men&limit=8&sort=-createdAt'),
          fetchProducts('category=unisex&limit=8&sort=-createdAt'),
          fetchProducts('limit=8&sort=-createdAt'),
          fetch('/api/storefront/testimonials?limit=12', { cache: 'no-store' })
            .then((r) => (r.ok ? r.json() : null))
            .then((b) => (b?.items ? b.items : []))
            .catch(() => []),
        ]);
        if (cancelled) return;
        setBestSellers({ women, men, unisex });
        setPopularProducts(popular);
        setTestimonials(reviews);
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[home data]', err);
        }
      } finally {
        if (!cancelled) {
          setBestSellersLoading(false);
          setPopularLoading(false);
        }
      }
    }
    loadAll();
    return () => {
      cancelled = true;
    };
  }, []);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 992);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const slides = [
    {
      id: 1,
      image: '/hero-section/s1_8f554bb3-d45a-45f9-8c3e-cd63a7ebe0b2.webp',
      subtitle: 'UNVEIL YOUR SCENT',
      title: 'Finest Perfumes',
      title2: 'Shop For Women',
      buttonText: 'SHOP NOW',
      background: 'linear-gradient(135deg, #f5f0e8, #ede4d3)'
    },
    {
      id: 2,
      image: '/hero-section/s4.webp',
      subtitle: 'TIMELESS ELEGANCE',
      title: 'Fragrance For',
      title2: 'Every Occasion',
      buttonText: 'SHOP NOW',
      background: 'linear-gradient(135deg, #f8e8ea, #f0d4d8)'
    },
    {
      id: 3,
      image: '/hero-section/s5.webp',
      subtitle: 'FRAGRANCES DEFINE YOU',
      title: 'Explore Your',
      title2: 'Signature Scent',
      buttonText: 'SHOP NOW',
      background: 'linear-gradient(135deg, #fff2e6, #ffe4cc)'
    }
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const handleTabClick = (tab) => {
    if (tab !== activeTab) {
      setIsChanging(true);
      setTimeout(() => {
        setActiveTab(tab);
        setIsChanging(false);
      }, 300);
    }
  };

  const currentProducts = bestSellers[activeTab] || [];

  // Testimonials are managed under admin → Content → Testimonials. The shape
  // returned by the API is { name, location, rating, body, image }; we adapt
  // it to the existing review-card shape and rotate through a small avatar
  // palette so cards still feel distinct.
  const AVATAR_COLORS = ['#C9A96E', '#5B7FA6', '#A67C6E', '#6E8C6E', '#8C6EA6', '#A67C52'];
  const clientReviews = (testimonials || []).map((t, i) => ({
    id: t.id || i + 1,
    name: t.name,
    location: t.location || '',
    rating: t.rating || 5,
    color: AVATAR_COLORS[i % AVATAR_COLORS.length],
    review: t.body,
    product: '',
    image: t.image || '',
  }));

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <div>
      {/* Hero Slider Section */}
      <section className="hero-slider">
        <div className="slider-container">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`slide ${index === currentSlide ? 'active' : ''}`}
              style={{ background: slide.background }}
            >
              {/* Background Image */}
              <div className="slide-bg-image">
                <Image 
                  src={slide.image} 
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  style={{ objectFit: 'cover', objectPosition: 'center right' }}
                />
              </div>
              
              {/* Content Overlay */}
              <div className="container">
                <div className="slide-content">
                  <div className="slide-text">
                    <p className="slide-subtitle">{slide.subtitle}</p>
                    <h1 className="slide-title">
                      {slide.title}<br />
                      <em>{slide.title2}</em>
                    </h1>
                    <Link href="/shop">
                      <button className="slide-button">
                        {slide.buttonText}
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button className="slider-nav prev" onClick={prevSlide}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
        </button>
        <button className="slider-nav next" onClick={nextSlide}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>

        {/* Slide Indicators */}
        <div className="slide-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div className="categories-grid">
            <div className="category-item large">
              <Link href="/shop/women" className="category-link">
                <div className="category-image">
                  <Image src="/259.webp" alt="Women Perfumes" width={600} height={400} />
                </div>
                <div className="category-content">
                  <h3>Women Perfumes</h3>
                  <span className="item-count">7 Items</span>
                </div>
                <span className="shop-now-cta">Shop Now</span>
              </Link>
            </div>

            <div className="category-item">
              <Link href="/shop/men" className="category-link">
                <div className="category-image">
                  <Image src="/11.webp" alt="Men Colognes" width={300} height={300} />
                </div>
                <div className="category-content">
                  <h3>Men Colognes</h3>
                  <span className="item-count">5 Items</span>
                </div>
                <span className="shop-now-cta">Shop Now</span>
              </Link>
            </div>

            <div className="category-item">
              <Link href="/shop" className="category-link">
                <div className="category-image">
                  <Image src="/3_4a5e3cd4-c4da-4955-a739-3dcdebf6f303.webp" alt="Gift Sets" width={300} height={300} />
                </div>
                <div className="category-content">
                  <h3>Gift Sets</h3>
                  <span className="item-count">10 Items</span>
                </div>
                <span className="shop-now-cta">Shop Now</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="best-sellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Best Sellers</h2>
            <div className="section-title-line"></div>
            
            {/* Bootstrap Tabs */}
            <ul className="nav nav-tabs justify-content-center" id="productTabs" role="tablist">
              <li className="nav-item" role="presentation">
                <button 
                  className={`nav-link ${activeTab === 'women' ? 'active' : ''}`}
                  onClick={() => handleTabClick('women')}
                  type="button"
                >
                  Women
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button 
                  className={`nav-link ${activeTab === 'men' ? 'active' : ''}`}
                  onClick={() => handleTabClick('men')}
                  type="button"
                >
                  Men
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === 'unisex' ? 'active' : ''}`}
                  onClick={() => handleTabClick('unisex')}
                  type="button"
                >
                  Unisex
                </button>
              </li>
            </ul>
            
            {/* Custom Navigation for Mobile - Between Tabs and Cards */}
            {isMobile && (
              <div className="custom-navigation">
                <button className="custom-nav-btn prev-btn" onClick={() => swiperRef.current?.slidePrev()}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15,18 9,12 15,6"></polyline>
                  </svg>
                </button>
                <button className="custom-nav-btn next-btn" onClick={() => swiperRef.current?.slideNext()}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          <div className="products-container">
            {isChanging && (
              <div className="loading-overlay">
                <div className="loading-spinner"></div>
              </div>
            )}

            {bestSellersLoading ? (
              <div className="products-grid">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="product-skeleton" aria-hidden="true">
                    <div className="skeleton-image" />
                    <div className="skeleton-line skeleton-line--title" />
                    <div className="skeleton-line skeleton-line--meta" />
                    <div className="skeleton-line skeleton-line--price" />
                  </div>
                ))}
              </div>
            ) : currentProducts.length === 0 ? (
              <div className="empty-state">
                <h3>No products yet in this collection</h3>
                <p>Add fragrances under <strong>Admin → Products</strong> and tag them with the <em>{activeTab}</em> category to make them appear here.</p>
              </div>
            ) : isMobile ? (
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={20}
                slidesPerView={1.2}
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                }}
                navigation={{ enabled: false }}
                pagination={{ clickable: true }}
                breakpoints={{
                  480: { slidesPerView: 1.5 },
                  640: { slidesPerView: 2 },
                  768: { slidesPerView: 2.5 },
                }}
                className={`products-swiper ${isChanging ? 'changing' : ''}`}
              >
                {currentProducts.map((product) => (
                  <SwiperSlide key={`${activeTab}-${product.id}`}>
                    <ProductCard product={product} className="swiper-product-card" />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className={`products-grid ${isChanging ? 'changing' : ''}`}>
                {currentProducts.map((product, index) => (
                  <div
                    key={`${activeTab}-${product.id}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <ProductCard product={product} className="desktop-product-card" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Popular Perfumes Section — only render when we have something */}
      {(popularLoading || popularProducts.length > 0) && (
        <section className="popular-perfumes-section">
          <div className="container">
            <div className="section-header">
              <h2>Popular Perfumes</h2>
              <div className="section-title-line"></div>
              <p className="section-subtitle">Each fragrance crafted to complement your unique essence</p>
            </div>

            {popularLoading ? (
              <div className="popular-products-grid">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="product-skeleton" aria-hidden="true">
                    <div className="skeleton-image" />
                    <div className="skeleton-line skeleton-line--title" />
                    <div className="skeleton-line skeleton-line--meta" />
                    <div className="skeleton-line skeleton-line--price" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Desktop grid: 4 cards on large screens */}
                <div className="popular-products-grid">
                  {popularProducts.slice(0, 4).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Mobile/tablet slider */}
                <div className="popular-products-container">
                  <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={20}
                    slidesPerView={1}
                    centeredSlides={false}
                    watchOverflow={true}
                    navigation={{
                      nextEl: '.popular-swiper-button-next',
                      prevEl: '.popular-swiper-button-prev',
                    }}
                    pagination={{
                      clickable: true,
                      el: '.popular-swiper-pagination',
                    }}
                    breakpoints={{
                      320: { slidesPerView: 1, spaceBetween: 15 },
                      576: { slidesPerView: 1.5, spaceBetween: 15 },
                      768: { slidesPerView: 2, spaceBetween: 20 },
                    }}
                    className="popular-products-swiper"
                  >
                    {popularProducts.map((product) => (
                      <SwiperSlide key={product.id}>
                        <ProductCard product={product} />
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  <div className="popular-swiper-button-prev swiper-nav-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15,18 9,12 15,6"></polyline>
                    </svg>
                  </div>
                  <div className="popular-swiper-button-next swiper-nav-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                  </div>

                  <div className="popular-swiper-pagination"></div>
                </div>

                <div className="view-all-container">
                  <Link href="/shop" className="view-all-btn">VIEW ALL</Link>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Client Reviews Section — only when testimonials exist */}
      {clientReviews.length > 0 && (
      <section className="client-reviews-section">
        <div className="container">
          <div className="section-header">
            <h2>What Our Clients Say</h2>
            <div className="section-title-line"></div>
            <p className="section-subtitle">Discover why thousands of customers love our fragrances</p>
          </div>
          
          <div className="reviews-container">
            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={30}
              slidesPerView={3}
              centeredSlides={false}
              loop={true}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
              }}
              navigation={{
                nextEl: '.reviews-swiper-button-next',
                prevEl: '.reviews-swiper-button-prev',
              }}
              breakpoints={{
                320: {
                  slidesPerView: 1,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 2,
                  spaceBetween: 25,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 30,
                }
              }}
              className="reviews-swiper"
            >
              {clientReviews.map((review) => (
                <SwiperSlide key={review.id}>
                  <div className="review-card">
                    <div className="review-header">
                      <div className="client-avatar">
                        <div className="avatar-initials" style={{ background: review.color }}>
                          {review.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      </div>
                      <div className="client-info">
                        <h4>{review.name}</h4>
                        <p className="client-location">{review.location}</p>
                        <div className="review-rating">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < review.rating ? 'star filled' : 'star'}>★</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="review-content">
                      <div className="quote-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" fill="currentColor"/>
                          <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" fill="currentColor"/>
                        </svg>
                      </div>
                      <p className="review-text">{review.review}</p>
                      {review.product ? (
                        <div className="review-product">
                          <span>Purchased: {review.product}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            
            {/* Custom Navigation - Positioned Below Cards */}
            <div className="reviews-navigation">
              <div className="reviews-swiper-button-prev reviews-nav-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15,18 9,12 15,6"></polyline>
                </svg>
              </div>
              <div className="reviews-swiper-button-next reviews-nav-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="reviews-stats">
            <div className="stat-item">
              <div className="stat-number">4.9</div>
              <div className="stat-label">Average Rating</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">2,500+</div>
              <div className="stat-label">Happy Customers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">98%</div>
              <div className="stat-label">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>
      )}
    </div>
  );
}
