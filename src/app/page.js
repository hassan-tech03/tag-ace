'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import ProductCard from '../components/ui/ProductCard';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState('women');
  const [isChanging, setIsChanging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const swiperRef = useRef(null);

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

  // Product data for different categories
  const productData = {
    women: [
      { id: 1, name: 'Love Edition For Her', price: '$30.00', originalPrice: '$60.00', badge: 'Save 50%' },
      { id: 2, name: 'Rose Elegance', price: '$45.00', originalPrice: null, badge: null },
      { id: 3, name: 'Floral Dreams', price: '$55.00', originalPrice: null, badge: 'New' },
      { id: 4, name: 'Feminine Touch', price: '$40.00', originalPrice: null, badge: null },
      { id: 5, name: 'Lady Charm', price: '$65.00', originalPrice: null, badge: null },
      { id: 6, name: 'Elegant Rose', price: '$50.00', originalPrice: null, badge: null },
      { id: 7, name: 'Sweet Blossom', price: '$35.00', originalPrice: null, badge: null },
      { id: 8, name: 'Royal Lady', price: '$80.00', originalPrice: null, badge: 'Limited' }
    ],
    men: [
      { id: 1, name: 'Arome Le Parfum', price: 'From $79.00', originalPrice: null, badge: null },
      { id: 2, name: 'Masculine Power', price: '$85.00', originalPrice: null, badge: null },
      { id: 3, name: 'Strong Essence', price: '$70.00', originalPrice: null, badge: 'New' },
      { id: 4, name: 'Bold Spirit', price: '$90.00', originalPrice: null, badge: null },
      { id: 5, name: 'Urban Legend', price: '$65.00', originalPrice: null, badge: null },
      { id: 6, name: 'Classic Man', price: '$75.00', originalPrice: null, badge: null },
      { id: 7, name: 'Wild Adventure', price: '$95.00', originalPrice: null, badge: null },
      { id: 8, name: 'Executive Choice', price: '$120.00', originalPrice: null, badge: 'Premium' }
    ],
    kids: [
      { id: 1, name: 'Little Angel', price: '$25.00', originalPrice: null, badge: null },
      { id: 2, name: 'Sweet Dreams', price: '$20.00', originalPrice: null, badge: null },
      { id: 3, name: 'Playful Scent', price: '$18.00', originalPrice: null, badge: 'New' },
      { id: 4, name: 'Gentle Touch', price: '$22.00', originalPrice: null, badge: null },
      { id: 5, name: 'Happy Kids', price: '$15.00', originalPrice: null, badge: null },
      { id: 6, name: 'Soft Breeze', price: '$28.00', originalPrice: null, badge: null },
      { id: 7, name: 'Innocent Joy', price: '$24.00', originalPrice: null, badge: null },
      { id: 8, name: 'Pure Delight', price: '$30.00', originalPrice: null, badge: 'Special' }
    ]
  };

  const currentProducts = productData[activeTab];

  // Popular Products Data
  const popularProducts = [
    { id: 1, name: 'Signature Scent', price: '$85.00', originalPrice: null, badge: 'Popular' },
    { id: 2, name: 'Midnight Rose', price: '$75.00', originalPrice: '$95.00', badge: 'Sale' },
    { id: 3, name: 'Ocean Breeze', price: '$90.00', originalPrice: null, badge: null },
    { id: 4, name: 'Golden Hour', price: '$120.00', originalPrice: null, badge: 'Limited' },
    { id: 5, name: 'Velvet Dreams', price: '$65.00', originalPrice: null, badge: null },
    { id: 6, name: 'Crystal Clear', price: '$110.00', originalPrice: null, badge: 'New' },
    { id: 7, name: 'Royal Essence', price: '$150.00', originalPrice: null, badge: 'Premium' },
    { id: 8, name: 'Pure Elegance', price: '$95.00', originalPrice: null, badge: null }
  ];

  // Client Reviews Data
  const clientReviews = [
    {
      id: 1,
      name: 'Sarah Johnson',
      location: 'New York, USA',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=120&h=120&fit=crop&crop=face',
      review: 'Absolutely love the Midnight Rose! The scent lasts all day and I get compliments everywhere I go. Will definitely be ordering more.',
      product: 'Midnight Rose'
    },
    {
      id: 2,
      name: 'Michael Chen',
      location: 'London, UK',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face',
      review: 'The quality is exceptional and the packaging is beautiful. Fast shipping and excellent customer service. Highly recommended!',
      product: 'Ocean Breeze'
    },
    {
      id: 3,
      name: 'Emma Wilson',
      location: 'Sydney, Australia',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face',
      review: 'I have been searching for the perfect signature scent for years. Finally found it with Arome! The Golden Hour is simply divine.',
      product: 'Golden Hour'
    },
    {
      id: 4,
      name: 'David Rodriguez',
      location: 'Madrid, Spain',
      rating: 4,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face',
      review: 'Great selection of fragrances. The Velvet Dreams has become my go-to evening scent. Professional service and fast delivery.',
      product: 'Velvet Dreams'
    },
    {
      id: 5,
      name: 'Lisa Thompson',
      location: 'Toronto, Canada',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face',
      review: 'The Crystal Clear fragrance is perfect for daily wear. Light, fresh, and sophisticated. Exactly what I was looking for!',
      product: 'Crystal Clear'
    },
    {
      id: 6,
      name: 'James Miller',
      location: 'Dubai, UAE',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face',
      review: 'Outstanding quality and unique scents. The Royal Essence is truly premium. Worth every penny and the presentation is luxurious.',
      product: 'Royal Essence'
    }
  ];

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
                      {slide.title2}
                    </h1>
                    <button className="slide-button">
                      {slide.buttonText}
                    </button>
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
              <a href="https://google.com" className="category-link">
                <div className="category-image">
                  <Image
                    src="/259.webp"
                    alt="Women Perfumes"
                    width={600}
                    height={400}
                  />
                </div>
                <div className="category-content">
                  <h3>Women Perfumes</h3>
                  <span className="item-count">(7 Items)</span>
                </div>
              </a>
            </div>
            
            <div className="category-item">
              <a href="https://google.com" className="category-link">
                <div className="category-image">
                  <Image
                    src="/11.webp"
                    alt="Men Colognes"
                    width={300}
                    height={300}
                  />
                </div>
                <div className="category-content">
                  <h3>Men Colognes</h3>
                  <span className="item-count">(5 Items)</span>
                </div>
              </a>
            </div>
            
            <div className="category-item">
              <a href="https://google.com" className="category-link">
                <div className="category-image">
                  <Image
                    src="/3_4a5e3cd4-c4da-4955-a739-3dcdebf6f303.webp"
                    alt="Gift Sets"
                    width={300}
                    height={300}
                  />
                </div>
                <div className="category-content">
                  <h3>Gift Sets</h3>
                  <span className="item-count">(10 Items)</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="best-sellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Best Sellers</h2>
            
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
                  className={`nav-link ${activeTab === 'kids' ? 'active' : ''}`}
                  onClick={() => handleTabClick('kids')}
                  type="button"
                >
                  Kid&apos;s
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
            
            {/* Desktop Grid / Mobile Swiper */}
            {isMobile ? (
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={20}
                slidesPerView={1.2}
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                }}
                navigation={{
                  enabled: false // Disable default navigation
                }}
                pagination={{ clickable: true }}
                breakpoints={{
                  480: {
                    slidesPerView: 1.5,
                  },
                  640: {
                    slidesPerView: 2,
                  },
                  768: {
                    slidesPerView: 2.5,
                  }
                }}
                className={`products-swiper ${isChanging ? 'changing' : ''}`}
              >
                {currentProducts.map((product, index) => (
                  <SwiperSlide key={`${activeTab}-${product.id}`}>
                    <ProductCard 
                      product={product} 
                      className="swiper-product-card"
                    />
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
                    <ProductCard 
                      product={product} 
                      className="desktop-product-card"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Popular Perfumes Section */}
      <section className="popular-perfumes-section">
        <div className="container">
          <div className="section-header">
            <h2>Popular Perfumes</h2>
            <p className="section-subtitle">Each fragrance crafted to complement unique essence</p>
          </div>
          
          <div className="popular-products-container">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={20}
              slidesPerView={4}
              centeredSlides={false}
              watchOverflow={true}
              navigation={{
                nextEl: '.popular-swiper-button-next',
                prevEl: '.popular-swiper-button-prev',
              }}
              pagination={{ 
                clickable: true,
                el: '.popular-swiper-pagination'
              }}
              breakpoints={{
                320: {
                  slidesPerView: 1,
                  spaceBetween: 15,
                },
                576: {
                  slidesPerView: 1.5,
                  spaceBetween: 15,
                },
                768: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                992: {
                  slidesPerView: 3,
                  spaceBetween: 25,
                },
                1200: {
                  slidesPerView: 4,
                  spaceBetween: 30,
                }
              }}
              className="popular-products-swiper"
            >
              {popularProducts.map((product) => (
                <SwiperSlide key={product.id}>
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>
            
            {/* Custom Navigation */}
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
            
            {/* Custom Pagination */}
            <div className="popular-swiper-pagination"></div>
          </div>
          
          <div className="view-all-container">
            <button className="view-all-btn">VIEW ALL</button>
          </div>
        </div>
      </section>

      {/* Client Reviews Section */}
      <section className="client-reviews-section">
        <div className="container">
          <div className="section-header">
            <h2>What Our Clients Say</h2>
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
                        <Image
                          src={review.avatar}
                          alt={review.name}
                          width={60}
                          height={60}
                        />
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
                      <div className="review-product">
                        <span>Purchased: {review.product}</span>
                      </div>
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
    </div>
  );
}
