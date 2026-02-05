'use client';

import { useState } from 'react';
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

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitStatus('success');
      setFormData({ 
        name: '', 
        email: '', 
        phone: '',
        subject: '', 
        message: '',
        inquiryType: 'general'
      });
      setIsSubmitting(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 2000);
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
                    <div className="stat-number">24/7</div>
                    <div className="stat-label">Customer Support</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">&lt;2h</div>
                    <div className="stat-label">Response Time</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">99%</div>
                    <div className="stat-label">Satisfaction Rate</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2">
              <div className="hero-image">
                <Image
                  src="/hero-section/s5.webp"
                  alt="Contact Tag Ace"
                  width={600}
                  height={400}
                  className="img-fluid rounded-4"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information Cards */}
      <div className="contact-info-section">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4 col-md-6">
              <div className="contact-card">
                <div className="contact-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <h3>Visit Our Store</h3>
                <p>123 Fragrance Avenue<br />New York, NY 10001<br />United States</p>
                <div className="contact-hours">
                  <strong>Store Hours:</strong><br />
                  Mon-Fri: 9:00 AM - 8:00 PM<br />
                  Sat-Sun: 10:00 AM - 6:00 PM
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="contact-card">
                <div className="contact-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <h3>Call Us</h3>
                <p className="phone-number">+1 (555) 123-4567</p>
                <p>Customer Service<br />Available 24/7</p>
                <div className="contact-hours">
                  <strong>International:</strong><br />
                  +1 (555) 123-4568
                </div>
              </div>
            </div>

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
                  <strong>General:</strong> info@tagace.com<br />
                  <strong>Support:</strong> support@tagace.com<br />
                  <strong>Orders:</strong> orders@tagace.com
                </p>
                <div className="contact-hours">
                  <strong>Response Time:</strong><br />
                  Usually within 2 hours
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                      <strong>Message sent successfully!</strong> We'll get back to you within 2 hours.
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
                          placeholder="John Doe"
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
                          placeholder="john@example.com"
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
                          placeholder="+1 (555) 123-4567"
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
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg"
                      disabled={isSubmitting}
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
                <p>Quick answers to common questions about Tag Ace fragrances</p>
              </div>

              <div className="faq-grid">
                <div className="faq-item">
                  <h4>🚚 What is your shipping policy?</h4>
                  <p>We offer free shipping on orders over $50. Standard delivery takes 3-5 business days within the US.</p>
                </div>

                <div className="faq-item">
                  <h4>🔄 Can I return or exchange products?</h4>
                  <p>Yes! We have a 30-day return policy. Items must be unopened and in original packaging for hygiene reasons.</p>
                </div>

                <div className="faq-item">
                  <h4>🎁 Do you offer gift wrapping?</h4>
                  <p>Absolutely! We provide complimentary gift wrapping for all orders. Just select the option at checkout.</p>
                </div>

                <div className="faq-item">
                  <h4>💳 What payment methods do you accept?</h4>
                  <p>We accept all major credit cards, PayPal, Apple Pay, and offer cash on delivery for select locations.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}