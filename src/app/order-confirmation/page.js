'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartContext } from '../../context/CartContext';

export default function OrderConfirmation() {
  const { clearCart } = useCartContext();
  const [orderData, setOrderData] = useState(null);
  const [orderNumber, setOrderNumber] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    // Don't force scroll to top - let user scroll naturally
    // Don't clear cart immediately - wait until order data is processed
  }, []);

  useEffect(() => {
    // Get order data from sessionStorage
    const storedOrder = sessionStorage.getItem('lastOrder');
    if (storedOrder) {
      const parsedOrder = JSON.parse(storedOrder);
      console.log('Order data found:', parsedOrder); // Debug log
      console.log('Order items:', parsedOrder.items); // Debug log
      console.log('Items length:', parsedOrder.items ? parsedOrder.items.length : 'undefined'); // Debug log
      setOrderData(parsedOrder);
      setOrderNumber(parsedOrder.orderNumber);
      
      // Clear the cart after successfully loading order data
      clearCart();
      
      // Clear the stored order data
      sessionStorage.removeItem('lastOrder');
    } else {
      console.log('No order data found in sessionStorage'); // Debug log
      // Fallback if no order data found - create sample data for testing
      const sampleOrderData = {
        orderNumber: `AR${Math.floor(Math.random() * 100000)}`,
        items: [
          {
            id: 1,
            name: "Love Edition For Her",
            price: 30.00,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop"
          },
          {
            id: 2,
            name: "Arome Le Parfum",
            price: 79.00,
            quantity: 2,
            image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=400&h=400&fit=crop"
          }
        ],
        customerInfo: {
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          phone: "+1 (555) 123-4567",
          address: "123 Main Street",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          country: "United States"
        },
        paymentMethod: 'Sample Order',
        subtotal: 188.00,
        shipping: 0,
        tax: 15.04,
        total: 203.04,
        orderDate: new Date().toISOString()
      };
      setOrderData(sampleOrderData);
      setOrderNumber(sampleOrderData.orderNumber);
    }
  }, [clearCart]);

  // Helper function to extract numeric price from string or number
  const getNumericPrice = (price) => {
    if (typeof price === 'number') {
      return price;
    }
    if (typeof price === 'string') {
      const match = price.match(/[\d.]+/);
      return match ? parseFloat(match[0]) : 0;
    }
    return 0;
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      // Dynamic import to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default;
      
      // Get the receipt content
      const element = document.getElementById('receipt-content');
      
      const options = {
        margin: 1,
        filename: `Tag-Ace-Receipt-${orderNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      await html2pdf().set(options).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="order-confirmation-page">
      <div className="container">
        <div className="confirmation-content" id="receipt-content">
          {/* Logo Header for Receipt */}
          <div className="receipt-header">
            <Image
              src="/logo.jpeg"
              alt="Tag Ace"
              width={150}
              height={50}
              className="receipt-logo"
            />
            <div className="company-info">
              <h2>Tag Ace</h2>
              <p>Premium Fragrance Collection</p>
              <p>Email: info@tagace.com | Phone: +1 (555) 123-4567</p>
            </div>
          </div>

          <div className="success-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22,4 12,14.01 9,11.01"></polyline>
            </svg>
          </div>
          
          <h1>Order Confirmed!</h1>
          <p className="confirmation-message">
            Thank you for your order! We&apos;ve received your order and will process it shortly.
            You&apos;ll receive an email confirmation with your order details.
          </p>
          
          <div className="order-details">
            <div className="detail-item">
              <span className="label">Order Number:</span>
              <span className="value">#{orderNumber}</span>
            </div>
            <div className="detail-item">
              <span className="label">Order Date:</span>
              <span className="value">{orderData?.orderDate ? new Date(orderData.orderDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
            <div className="detail-item">
              <span className="label">Payment Method:</span>
              <span className="value">{orderData?.paymentMethod || 'Cash on Delivery'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Order Status:</span>
              <span className="value status-confirmed">Confirmed</span>
            </div>
            <div className="detail-item">
              <span className="label">Estimated Delivery:</span>
              <span className="value">3-5 Business Days</span>
            </div>
            {orderData?.stripeSessionId && (
              <div className="detail-item">
                <span className="label">Transaction ID:</span>
                <span className="value">{orderData.stripeSessionId.substring(0, 20)}...</span>
              </div>
            )}
          </div>

          {/* Order Items */}
          {orderData?.items && orderData.items.length > 0 ? (
            <div className="order-receipt">
              <h3>📦 Order Summary</h3>
              <div className="receipt-items">
                {orderData.items.map((item, index) => (
                  <div key={index} className="receipt-item">
                    <div className="item-image">
                      <Image
                        src="/1_08ff09db-b9b0-4781-8774-8c5872176160_360x.webp"
                        alt={item.name}
                        width={80}
                        height={80}
                      />
                    </div>
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p>TAG ACE • 100ML</p>
                      <p className="quantity">Qty: {item.quantity}</p>
                    </div>
                    <div className="item-price">
                      ${(getNumericPrice(item.price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="receipt-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>${orderData.subtotal.toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>Shipping</span>
                  <span>{orderData.shipping === 0 ? 'Free' : `$${orderData.shipping.toFixed(2)}`}</span>
                </div>
                <div className="total-row">
                  <span>Tax</span>
                  <span>${orderData.tax.toFixed(2)}</span>
                </div>
                <div className="total-row total-final">
                  <span>Total</span>
                  <span>${orderData.total.toFixed(2)} USD</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="order-receipt">
              <h3>📦 Order Summary</h3>
              <div className="no-items-message">
                <p>Order items information is not available.</p>
                {orderData && (
                  <div className="receipt-totals">
                    <div className="total-row total-final">
                      <span>Total</span>
                      <span>${orderData.total ? orderData.total.toFixed(2) : '0.00'} USD</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Shipping Information */}
          {orderData?.customerInfo && (
            <div className="shipping-info">
              <h3>Shipping Information</h3>
              <div className="shipping-details">
                <div className="address-section">
                  <h4>Delivery Address:</h4>
                  <p><strong>{orderData.customerInfo.firstName} {orderData.customerInfo.lastName}</strong></p>
                  <p>{orderData.customerInfo.address}</p>
                  {orderData.customerInfo.apartment && <p>{orderData.customerInfo.apartment}</p>}
                  <p>{orderData.customerInfo.city}, {orderData.customerInfo.state} {orderData.customerInfo.zipCode}</p>
                  <p>{orderData.customerInfo.country}</p>
                </div>
                <div className="contact-section">
                  <h4>Contact Information:</h4>
                  <p><strong>Email:</strong> {orderData.customerInfo.email}</p>
                  <p><strong>Phone:</strong> {orderData.customerInfo.phone}</p>
                </div>
              </div>
            </div>
          )}

          {/* Additional Order Information */}
          <div className="additional-info">
            <h3>Important Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <h4>📦 Shipping Policy</h4>
                <p>Free shipping on orders over $50. Standard delivery takes 3-5 business days.</p>
              </div>
              <div className="info-item">
                <h4>🔄 Return Policy</h4>
                <p>30-day return policy. Items must be unopened and in original packaging.</p>
              </div>
              <div className="info-item">
                <h4>📞 Customer Support</h4>
                <p>Need help? Contact us at support@tagace.com or call +1 (555) 123-4567</p>
              </div>
              <div className="info-item">
                <h4>🎁 Gift Message</h4>
                <p>{orderData?.customerInfo?.specialInstructions || 'No special instructions provided'}</p>
              </div>
            </div>
          </div>

          {/* Receipt Footer */}
          <div className="receipt-footer">
            <p>Thank you for choosing Tag Ace!</p>
            <p className="footer-note">This is your official order confirmation. Please keep this for your records.</p>
            <div className="footer-logo">
              <Image
                src="/logo.jpeg"
                alt="Tag Ace"
                width={100}
                height={33}
              />
            </div>
          </div>
        </div>

        {/* Action buttons outside of receipt content */}
        <div className="confirmation-actions">
          <div className="export-section">
            <button 
              onClick={generatePDF}
              disabled={isGeneratingPDF}
              className="export-pdf-btn"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="loading-spinner"></div>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10,9 9,9 8,9"></polyline>
                  </svg>
                  Export Receipt as PDF
                </>
              )}
            </button>
          </div>
          
          <div className="action-buttons">
            <Link href="/shop">
              <button className="continue-shopping-btn">
                Continue Shopping
              </button>
            </Link>
            <Link href="/">
              <button className="home-btn">
                Back to Home
              </button>
            </Link>
          </div>
          
          <div className="help-section">
            <h3>Need Help?</h3>
            <p>If you have any questions about your order, please contact our customer service.</p>
            <Link href="/contact">
              <button className="contact-btn">Contact Us</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
