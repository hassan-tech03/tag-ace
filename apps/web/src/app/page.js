'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Image, { getImageProps } from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import ProductCard from '../components/ui/ProductCard';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Mobile/tablet product carousels: whole cards per view (no half-cut peek),
// one dot per page, arrows + dots together in one row below.
const CAROUSEL_SETTINGS = {
  watchOverflow: true,
  slidesPerView: 2,
  slidesPerGroup: 2,
  spaceBetween: 12,
  breakpoints: {
    768: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 16 },
  },
};

function CarouselControls({ prevClass, nextClass, dotsClass, label }) {
  return (
    <div className="carousel-controls">
      <button type="button" className={`carousel-arrow ${prevClass}`} aria-label={`Previous ${label}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <polyline points="15,18 9,12 15,6"></polyline>
        </svg>
      </button>
      <div className={`carousel-dots ${dotsClass}`}></div>
      <button type="button" className={`carousel-arrow ${nextClass}`} aria-label={`Next ${label}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <polyline points="9,18 15,12 9,6"></polyline>
        </svg>
      </button>
    </div>
  );
}

// Art-directed hero image. Below 992px the copy sits at the top, so phones
// get a portrait banner and tablets a wider one, both with the bottle low in
// the frame; desktop gets the wide banner with the bottle on the right. The
// browser downloads only the source that matches.
function HeroPicture({ slide, priority }) {
  const common = { alt: '', sizes: '100vw', priority };
  const srcSet = (src, width, height) => getImageProps({ ...common, src, width, height }).props.srcSet;
  const { props: imgProps } = getImageProps({ ...common, src: slide.image, width: 3200, height: 1200 });
  return (
    <picture>
      <source media="(max-width: 576px)" srcSet={srcSet(slide.mobileImage, 1080, 1440)} sizes="100vw" />
      <source media="(max-width: 991px)" srcSet={srcSet(slide.tabletImage, 1600, 1400)} sizes="100vw" />
      <source srcSet={srcSet(slide.image, 3200, 1200)} sizes="100vw" />
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img {...imgProps} className="hero-img" />
    </picture>
  );
}

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState('women');
  const [isChanging, setIsChanging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const swiperRef = useRef(null);

  // All product content is driven from the admin dashboard via the
  // /api/storefront/* endpoints. Empty arrays render a polite empty state
  // instead of dummy data.
  const [bestSellers, setBestSellers] = useState({ women: [], men: [] });
  const [popularProducts, setPopularProducts] = useState([]);
  const [popularTitle, setPopularTitle] = useState('New Arrivals');
  const [counts, setCounts] = useState({ women: null, men: null });
  const [autoplayKey, setAutoplayKey] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [testimonials, setTestimonials] = useState([]);
  const [bestSellersLoading, setBestSellersLoading] = useState(true);
  const [popularLoading, setPopularLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      const fetchPage = (qs) =>
        fetch(`/api/storefront/products?${qs}`, { cache: 'no-store' })
          .then((r) => (r.ok ? r.json() : null))
          .then((b) => ({ items: b?.items || [], total: Number(b?.total || 0) }))
          .catch(() => ({ items: [], total: 0 }));

      try {
        const [womenRes, menRes, newRes, saleRes, reviews] = await Promise.all([
          fetchPage('category=women&limit=8&sort=-createdAt'),
          fetchPage('category=men&limit=8&sort=-createdAt'),
          fetchPage('newArrival=true&limit=8&sort=-createdAt'),
          fetchPage('hotDeal=true&limit=8&sort=-createdAt'),
          fetch('/api/storefront/testimonials?limit=12', { cache: 'no-store' })
            .then((r) => (r.ok ? r.json() : null))
            .then((b) => (b?.items ? b.items : []))
            .catch(() => []),
        ]);
        if (cancelled) return;
        setBestSellers({ women: womenRes.items, men: menRes.items });
        setCounts({ women: womenRes.total, men: menRes.total });
        // Second section shows different products from Best Sellers:
        // New Arrivals, or On Sale when nothing is marked new.
        if (newRes.items.length > 0) {
          setPopularTitle('New Arrivals');
          setPopularProducts(newRes.items);
        } else {
          setPopularTitle('On Sale');
          setPopularProducts(saleRes.items);
        }
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
      image: '/hero-section/banner-noir.webp',
      mobileImage: '/hero-section/banner-noir-mobile.webp',
      tabletImage: '/hero-section/banner-noir-tablet.webp',
      subtitle: 'UNVEIL YOUR SCENT',
      title: 'Finest Perfumes',
      title2: 'Shop For Women',
      buttonText: 'SHOP NOW',
      background: 'linear-gradient(135deg, #f5f0e8, #ede4d3)'
    },
    {
      id: 2,
      image: '/hero-section/banner-amber.webp',
      mobileImage: '/hero-section/banner-amber-mobile.webp',
      tabletImage: '/hero-section/banner-amber-tablet.webp',
      subtitle: 'TIMELESS ELEGANCE',
      title: 'Fragrance For',
      title2: 'Every Occasion',
      buttonText: 'SHOP NOW',
      background: 'linear-gradient(135deg, #f8e8ea, #f0d4d8)'
    },
    {
      id: 3,
      image: '/hero-section/banner-onyx.webp',
      mobileImage: '/hero-section/banner-onyx-mobile.webp',
      tabletImage: '/hero-section/banner-onyx-tablet.webp',
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

  // Manual navigation restarts the autoplay timer, so a click is never
  // followed by an immediate automatic jump (which made the arrows look
  // reversed).
  const goNext = () => {
    nextSlide();
    setAutoplayKey((k) => k + 1);
  };
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setAutoplayKey((k) => k + 1);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setAutoplayKey((k) => k + 1);
  };

  // Swipe on touch screens.
  const touchStartX = useRef(null);
  const onHeroTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onHeroTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) goNext();
    else prevSlide();
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

  // Auto-slide every 6s; paused while hovered/focused; restarted after any
  // manual navigation (autoplayKey).
  useEffect(() => {
    if (heroPaused) return undefined;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [nextSlide, autoplayKey, heroPaused]);

  return (
    <div>
      {/* One page heading for search engines / screen readers. */}
      <h1 className="visually-hidden">Mushk Perfumes · Premium Perfumes for Men &amp; Women in Pakistan</h1>
      {/* Hero Slider Section */}
      <section
        className="hero-slider"
        aria-roledescription="carousel"
        aria-label="Featured collections"
        onMouseEnter={() => setHeroPaused(true)}
        onMouseLeave={() => setHeroPaused(false)}
        onFocus={() => setHeroPaused(true)}
        onBlur={() => setHeroPaused(false)}
        onTouchStart={onHeroTouchStart}
        onTouchEnd={onHeroTouchEnd}
      >
        <div className="slider-container">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`slide ${index === currentSlide ? 'active' : ''}`}
              style={{ background: slide.background }}
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}`}
              aria-hidden={index !== currentSlide}
              inert={index !== currentSlide ? '' : undefined}
            >
              {/* Background Image */}
              <div className="slide-bg-image">
                <HeroPicture slide={slide} priority={index === 0} />
              </div>

              {/* Content Overlay */}
              <div className="container">
                <div className="slide-content">
                  <div className="slide-text">
                    <p className="slide-subtitle">{slide.subtitle}</p>
                    <p className="slide-title">
                      {slide.title}<br />
                      <em>{slide.title2}</em>
                    </p>
                    <Link href="/shop" className="slide-button">
                      {slide.buttonText}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls: side arrows on desktop; one row (arrow · dots · arrow)
            under the copy on tablet/mobile so nothing covers the heading. */}
        <div className="hero-controls">
          <button type="button" className="slider-nav prev" onClick={prevSlide} aria-label="Previous slide">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </button>
          <div className="slide-indicators">
            {slides.map((s, index) => (
              <button
                key={index}
                type="button"
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}: ${s.title} ${s.title2}`}
                aria-current={index === currentSlide ? 'true' : undefined}
              />
            ))}
          </div>
          <button type="button" className="slider-nav next" onClick={goNext} aria-label="Next slide">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div className="categories-grid">
            {[
              { href: '/shop/women', title: "Women's Perfumes", img: '/images/site/cat-women.jpg', count: counts.women, large: true },
              { href: '/shop/men', title: "Men's Perfumes", img: '/images/site/cat-men.jpg', count: counts.men },
              {
                href: '/shop',
                title: 'All Perfumes',
                img: '/images/site/cat-all.jpg',
                count: counts.women == null || counts.men == null ? null : counts.women + counts.men,
              },
            ].map((c) => (
              <div key={c.href} className={`category-item${c.large ? ' large' : ''}`}>
                <Link href={c.href} className="category-link">
                  <div className="category-image">
                    <Image src={c.img} alt="" fill sizes="(max-width: 992px) 100vw, 50vw" />
                  </div>
                  <div className="category-content">
                    <h3>{c.title}</h3>
                    {c.count != null && (
                      <span className="item-count">{c.count} {c.count === 1 ? 'fragrance' : 'fragrances'}</span>
                    )}
                    <span className="shop-now-cta">Shop now</span>
                  </div>
                </Link>
              </div>
            ))}
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
            </ul>

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
              <>
                <Swiper
                  key={activeTab}
                  modules={[Navigation, Pagination]}
                  {...CAROUSEL_SETTINGS}
                  navigation={{ prevEl: '.bs-prev', nextEl: '.bs-next' }}
                  pagination={{ el: '.bs-dots', clickable: true }}
                  onSwiper={(swiper) => {
                    swiperRef.current = swiper;
                  }}
                  className={`products-swiper ${isChanging ? 'changing' : ''}`}
                >
                  {currentProducts.map((product) => (
                    <SwiperSlide key={`${activeTab}-${product.id}`}>
                      <ProductCard product={product} className="swiper-product-card" />
                    </SwiperSlide>
                  ))}
                </Swiper>
                <CarouselControls prevClass="bs-prev" nextClass="bs-next" dotsClass="bs-dots" label="best sellers" />
              </>
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
              <h2>{popularTitle}</h2>
              <div className="section-title-line"></div>
              <p className="section-subtitle">
                {popularTitle === 'New Arrivals' ? 'The latest additions to the Mushk collection' : 'Our favourite fragrances, now at a special price'}
              </p>
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
                    {...CAROUSEL_SETTINGS}
                    navigation={{ prevEl: '.np-prev', nextEl: '.np-next' }}
                    pagination={{ el: '.np-dots', clickable: true }}
                    className="popular-products-swiper"
                  >
                    {popularProducts.map((product) => (
                      <SwiperSlide key={product.id}>
                        <ProductCard product={product} />
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  <CarouselControls prevClass="np-prev" nextClass="np-next" dotsClass="np-dots" label={popularTitle.toLowerCase()} />
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
