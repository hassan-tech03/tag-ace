'use client';

import Image from 'next/image';
import Link from 'next/link';
import '../../styles/globals.scss';

export default function AboutUs() {
  return (
    <div className="about-us-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8 mx-auto text-center">
              <h1 className="hero-title">About Tag Ace</h1>
              <p className="hero-description">
                Premium fragrances that tell your story. Discover the art of scent 
                and let every moment become a beautiful memory.
              </p>
              <div className="hero-stats">
                <div className="stat-item">
                  <h3>10+</h3>
                  <p>Years Experience</p>
                </div>
                <div className="stat-item">
                  <h3>50K+</h3>
                  <p>Happy Customers</p>
                </div>
                <div className="stat-item">
                  <h3>100+</h3>
                  <p>Unique Fragrances</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="our-story">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="story-image">
                <Image
                  src="/hero-section/s1_8f554bb3-d45a-45f9-8c3e-cd63a7ebe0b2.webp"
                  alt="Tag Ace Story"
                  width={600}
                  height={500}
                  className="img-fluid"
                />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="story-content">
                <h3>Our Story</h3>
                <p>
                  Tag Ace was founded with a simple vision: to create fragrances that capture 
                  life's most precious moments. Every bottle tells a story, every scent evokes 
                  a memory that lasts forever.
                </p>
                <p>
                  From our humble beginnings to becoming a trusted name in premium fragrances, 
                  we've remained committed to quality, craftsmanship, and customer satisfaction.
                </p>
                <div className="story-highlights">
                  <div className="highlight-item">
                    <div className="highlight-icon">✨</div>
                    <div className="highlight-text">
                      <h4>Premium Quality</h4>
                      <p>Only the finest ingredients from around the world</p>
                    </div>
                  </div>
                  <div className="highlight-item">
                    <div className="highlight-icon">🎨</div>
                    <div className="highlight-text">
                      <h4>Artisan Craftsmanship</h4>
                      <p>Each fragrance is carefully crafted by master perfumers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="our-values">
        <div className="container">
          <h2 className="section-title">Our Values</h2>
          <p className="section-subtitle">The principles that guide everything we do</p>
          <div className="row">
            <div className="col-lg-4 col-md-6">
              <div className="value-card">
                <div className="value-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"></polygon>
                  </svg>
                </div>
                <h3>Excellence</h3>
                <p>We never compromise on quality and craftsmanship in every fragrance we create.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="value-card">
                <div className="value-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </div>
                <h3>Passion</h3>
                <p>Our love for fragrance drives everything we create and every relationship we build.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="value-card">
                <div className="value-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3>Trust</h3>
                <p>Building lasting relationships through transparency and exceptional service.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="our-team">
        <div className="container">
          <h2 className="section-title">Meet Our Team</h2>
          <p className="section-subtitle">The passionate people behind Tag Ace</p>
          <div className="row">
            <div className="col-lg-4 col-md-6">
              <div className="team-card">
                <div className="team-image">
                  <Image
                    src="/1_08ff09db-b9b0-4781-8774-8c5872176160_360x.webp"
                    alt="Sarah Johnson"
                    width={400}
                    height={300}
                    className="img-fluid"
                  />
                </div>
                <div className="team-info">
                  <h3>Sarah Johnson</h3>
                  <p className="team-role">Founder & Master Perfumer</p>
                  <p className="team-description">
                    Leading our creative vision with 15+ years of experience in luxury fragrance creation.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="team-card">
                <div className="team-image">
                  <Image
                    src="/3_4a5e3cd4-c4da-4955-a739-3dcdebf6f303_360x.webp"
                    alt="Michael Chen"
                    width={400}
                    height={300}
                    className="img-fluid"
                  />
                </div>
                <div className="team-info">
                  <h3>Michael Chen</h3>
                  <p className="team-role">Head of Operations</p>
                  <p className="team-description">
                    Ensuring smooth operations and exceptional service delivery to our valued customers.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="team-card">
                <div className="team-image">
                  <Image
                    src="/259.webp"
                    alt="Emma Rodriguez"
                    width={400}
                    height={300}
                    className="img-fluid"
                  />
                </div>
                <div className="team-info">
                  <h3>Emma Rodriguez</h3>
                  <p className="team-role">Creative Director</p>
                  <p className="team-description">
                    Bringing our brand to life through compelling storytelling and innovative design.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="our-mission">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="mission-content">
                <h2 className="section-title">Our Mission</h2>
                <p className="mission-text">
                  To create exceptional fragrances that inspire confidence and become 
                  an integral part of life's beautiful moments.
                </p>
                <div className="mission-points">
                  <div className="mission-point">
                    <div className="point-icon">✨</div>
                    <div className="point-text">
                      <h4>Premium Ingredients</h4>
                      <p>Sourcing the finest materials from around the world</p>
                    </div>
                  </div>
                  <div className="mission-point">
                    <div className="point-icon">🎨</div>
                    <div className="point-text">
                      <h4>Artisan Craftsmanship</h4>
                      <p>Every fragrance is a work of art created by master perfumers</p>
                    </div>
                  </div>
                  <div className="mission-point">
                    <div className="point-icon">💝</div>
                    <div className="point-text">
                      <h4>Memorable Experiences</h4>
                      <p>Creating scents that capture and preserve precious memories</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="mission-image">
                <Image
                  src="/hero-section/s4.webp"
                  alt="Our Mission"
                  width={600}
                  height={500}
                  className="img-fluid"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <h2>Ready to Find Your Perfect Scent?</h2>
          <p>Discover our collection of premium fragrances and let your story unfold</p>
          <div className="cta-buttons">
            <Link href="/shop" className="btn btn-primary">Shop Now</Link>
            <Link href="/contact" className="btn btn-outline-primary">Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}