'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  // Store contact details from Admin → Site Content.
  const [store, setStore] = useState({ address: '', phone: '', email: '' });

  useEffect(() => {
    let cancelled = false;
    fetch('/api/storefront/settings', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((b) => {
        if (cancelled || !b?.storeInfo) return;
        setStore({
          address: b.storeInfo.address || '',
          phone: b.storeInfo.phone || '',
          email: b.storeInfo.email || '',
        });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // There is no message inbox in the backend yet, so the form opens the
  // visitor's email app with the message addressed to the store.
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!store.email) return;
    setIsSubmitting(true);
    const subject = `[${formData.inquiryType}] ${formData.subject || 'Website enquiry'}`;
    const body = [
      formData.message,
      '',
      '—',
      `Name: ${formData.name}`,
      `Email: ${formData.email}`,
      formData.phone ? `Phone: ${formData.phone}` : null,
    ].filter((l) => l !== null).join('\n');
    window.location.href = `mailto:${store.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSubmitStatus('success');
    setIsSubmitting(false);
    setTimeout(() => setSubmitStatus(null), 8000);
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <div className="contact-hero">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 order-2 order-lg-1">
              <div className="hero-content">
                <h1>Get in Touch</h1>
                <p className="hero-subtitle">
                  We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                </p>
                <div className="hero-stats">
                  <div className="stat-item">
                    <div className="stat-number">COD</div>
                    <div className="stat-label">Cash on Delivery</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">2</div>
                    <div className="stat-label">Collections: Men &amp; Women</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">100%</div>
                    <div className="stat-label">Secure Checkout</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2">
              <div className="hero-image">
                <Image
                  src="/hero-section/s5.webp"
                  alt="Contact Mushk"
                  width={600}
                  height={400}
                  className="img-fluid rounded-4"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information Cards (only once details are set in Site Content) */}
      {(store.address || store.phone || store.email) && (
      <div className="contact-info-section">
        <div className="container">
          <div className="row g-4 justify-content-center">
            {store.address && (
              <div className="col-lg-4 col-md-6">
                <div className="contact-card">
                  <div className="contact-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <h3>Visit Us</h3>
                  <p style={{ whiteSpace: 'pre-line' }}>{store.address}</p>
                </div>
              </div>
            )}

            {store.phone && (
              <div className="col-lg-4 col-md-6">
                <div className="contact-card">
                  <div className="contact-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <h3>Call Us</h3>
                  <p className="phone-number">
                    <a href={`tel:${store.phone.replace(/[^+0-9]/g, '')}`}>{store.phone}</a>
                  </p>
                </div>
              </div>
            )}

            {store.email && (
              <div className="col-lg-4 col-md-6">
                <div className="contact-card">
                  <div className="contact-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <h3>Email Us</h3>
                  <p>
                    <a href={`mailto:${store.email}`}>{store.email}</a>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Contact Form Section */}
      <div className="contact-form-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto">
              <div className="form-header text-center">
                <h2>Send Us a Message</h2>
                <p>Have a question about our fragrances? Need help with an order? We're here to help!</p>
              </div>

              {submitStatus === 'success' && (
                <div className="alert alert-success" role="alert">
                  <div className="d-flex align-items-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22,4 12,14.01 9,11.01"></polyline>
                    </svg>
                    <div>
                      <strong>Your email app has opened with your message.</strong> Press send there and we'll get back to you soon.
                    </div>
                  </div>
                </div>
              )}

              <div className="contact-form-card">
                <form onSubmit={handleSubmit}>
                  {/* Inquiry Type */}
                  <div className="form-group mb-4">
                    <label htmlFor="inquiryType" className="form-label">What can we help you with?</label>
                    <select
                      className="form-select"
                      id="inquiryType"
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="general">General Inquiry</option>
                      <option value="product">Product Information</option>
                      <option value="order">Order Support</option>
                      <option value="shipping">Shipping & Returns</option>
                      <option value="wholesale">Wholesale Opportunities</option>
                      <option value="press">Press & Media</option>
                    </select>
                  </div>

                  {/* Name and Email Row */}
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group mb-4">
                        <label htmlFor="name" className="form-label">Full Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your name"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group mb-4">
                        <label htmlFor="email" className="form-label">Email Address *</label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phone and Subject Row */}
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group mb-4">
                        <label htmlFor="phone" className="form-label">Phone Number</label>
                        <input
                          type="tel"
                          className="form-control"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="03XX XXXXXXX"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group mb-4">
                        <label htmlFor="subject" className="form-label">Subject *</label>
                        <input
                          type="text"
                          className="form-control"
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          placeholder="How can we help you?"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="form-group mb-4">
                    <label htmlFor="message" className="form-label">Message *</label>
                    <textarea
                      className="form-control"
                      id="message"
                      name="message"
                      rows="6"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us more about your inquiry..."
                      required
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <div className="text-center">
                    {!store.email && (
                      <p className="text-muted small mb-3">
                        Our contact email will be available here shortly.
                      </p>
                    )}
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={isSubmitting || !store.email}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          Sending Message...
                        </>
                      ) : (
                        <>
                          Send Message
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ms-2">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto">
              <div className="section-header text-center">
                <h2>Frequently Asked Questions</h2>
                <p>Quick answers to common questions about Mushk fragrances</p>
              </div>

              <div className="faq-grid">
                <div className="faq-item">
                  <h4>💳 What payment methods do you accept?</h4>
                  <p>You can pay securely by debit or credit card at checkout, or choose Cash on Delivery and pay when your order arrives.</p>
                </div>

                <div className="faq-item">
                  <h4>🛍️ How do I place an order?</h4>
                  <p>Browse the Men or Women collection, add fragrances to your cart and check out with your delivery details. You'll get an order number as soon as it's placed.</p>
                </div>

                <div className="faq-item">
                  <h4>📦 Can I change or cancel my order?</h4>
                  <p>Get in touch with us as soon as possible using the details on this page and include your order number, and we'll do our best to help.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}