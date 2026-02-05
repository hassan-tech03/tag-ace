"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCartContext } from "../../context/CartContext";
import "../../styles/globals.scss";
import "../../styles/no-underlines.css";

export default function CheckoutClient() {
  const { cartItems, getCartTotal, isLoaded } = useCartContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [formData, setFormData] = useState({
    // Contact Information
    email: "",
    phone: "",

    // Shipping Address
    firstName: "",
    lastName: "",
    company: "",
    address: "",
    apartment: "",
    city: "",
    country: "United States",
    state: "",
    zipCode: "",

    // Billing Address
    sameAsShipping: true,
    billingFirstName: "",
    billingLastName: "",
    billingCompany: "",
    billingAddress: "",
    billingApartment: "",
    billingCity: "",
    billingCountry: "United States",
    billingState: "",
    billingZipCode: "",

    // Additional Options
    saveInfo: false,
    newsletter: false,
    specialInstructions: "",
  });

  // Helper function to extract numeric price from string or number
  const getNumericPrice = (price) => {
    if (typeof price === "number") return price;
    if (typeof price === "string") {
      const match = price.match(/[\d.]+/);
      return match ? parseFloat(match[0]) : 0;
    }
    return 0;
  };

  const subtotal = getCartTotal() || 0;
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const handleStripePaymentSuccess = useCallback(
    (sessionId) => {
      const orderData = {
        orderNumber: `AR${Math.floor(Math.random() * 100000)}`,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        customerInfo: formData,
        paymentMethod: "Credit Card (Stripe)",
        subtotal,
        shipping,
        tax,
        total,
        orderDate: new Date().toISOString(),
        stripeSessionId: sessionId,
      };

      sessionStorage.setItem("lastOrder", JSON.stringify(orderData));
      window.location.href = "/order-confirmation";
    },
    [cartItems, formData, subtotal, shipping, tax, total]
  );

  // Check for payment success/failure from Stripe Checkout
  useEffect(() => {
    const paymentSuccess = searchParams.get("payment_success");
    const paymentCancelled = searchParams.get("payment_cancelled");
    const sessionId = searchParams.get("session_id");

    if (paymentSuccess === "true" && sessionId) {
      handleStripePaymentSuccess(sessionId);
    } else if (paymentCancelled === "true") {
      setPaymentStatus("cancelled");
      setTimeout(() => setPaymentStatus(null), 5000);
    }
  }, [searchParams, handleStripePaymentSuccess]);

  // Redirect if cart is empty (only after cart has loaded)
  useEffect(() => {
    if (isLoaded && cartItems.length === 0) {
      router.push("/cart");
    }
  }, [cartItems, router, isLoaded]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (paymentMethod === "cod") {
      handleCODOrder();
    }
  };

  const handleCODOrder = async () => {
    setIsLoading(true);

    try {
      const orderData = {
        orderNumber: `AR${Math.floor(Math.random() * 100000)}`,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        customerInfo: formData,
        paymentMethod: "Cash on Delivery",
        subtotal,
        shipping,
        tax,
        total,
        orderDate: new Date().toISOString(),
      };

      sessionStorage.setItem("lastOrder", JSON.stringify(orderData));

      await new Promise((resolve) => setTimeout(resolve, 2000));
      window.location.href = "/order-confirmation";
    } catch (error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.email &&
      formData.phone &&
      formData.firstName &&
      formData.lastName &&
      formData.address &&
      formData.city &&
      formData.state &&
      formData.zipCode
    );
  };

  const handleStripeCheckout = async () => {
    if (!isFormValid()) {
      alert("Please fill in all required fields before proceeding with payment.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems,
          customerInfo: formData,
          total,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error creating checkout session:", error);
      }
      alert("Failed to create checkout session. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded || (isLoaded && cartItems.length === 0)) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="loading-checkout">
            <div className="loading-spinner"></div>
            <p>{!isLoaded ? "Loading checkout..." : "Redirecting to cart..."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {/* Header */}
      <div className="checkout-header">
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/cart">Cart</Link>
            <span>/</span>
            <span>Checkout</span>
          </nav>
          <div className="checkout-logo">
            <Link href="/">
              <Image src="/logo.jpeg" alt="Tag Ace" width={120} height={40} />
            </Link>
          </div>
        </div>
      </div>

      <div className="checkout-content">
        <div className="container">
          <div className="row">
            {/* Left Column - Forms */}
            <div className="col-lg-7">
              <form id="checkout-form" onSubmit={handleSubmit} className="checkout-form">
                {/* Contact Information */}
                <div className="form-section">
                  <h2>Contact Information</h2>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="email">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Phone Number *</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="form-options">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="newsletter"
                        checked={formData.newsletter}
                        onChange={handleInputChange}
                      />
                      <span className="checkmark"></span>
                      Email me with news and offers
                    </label>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="form-section">
                  <h2>Shipping Address</h2>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName">First Name *</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        placeholder="John"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="lastName">Last Name *</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="company">Company (Optional)</label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="Company Name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">Address *</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="apartment">Apartment, suite, etc. (Optional)</label>
                    <input
                      type="text"
                      id="apartment"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleInputChange}
                      placeholder="Apartment, suite, etc."
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="city">City *</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        placeholder="New York"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="state">State *</label>
                      <select
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select State</option>
                        <option value="AL">Alabama</option>
                        <option value="AK">Alaska</option>
                        <option value="AZ">Arizona</option>
                        <option value="AR">Arkansas</option>
                        <option value="CA">California</option>
                        <option value="CO">Colorado</option>
                        <option value="CT">Connecticut</option>
                        <option value="DE">Delaware</option>
                        <option value="FL">Florida</option>
                        <option value="GA">Georgia</option>
                        <option value="HI">Hawaii</option>
                        <option value="ID">Idaho</option>
                        <option value="IL">Illinois</option>
                        <option value="IN">Indiana</option>
                        <option value="IA">Iowa</option>
                        <option value="KS">Kansas</option>
                        <option value="KY">Kentucky</option>
                        <option value="LA">Louisiana</option>
                        <option value="ME">Maine</option>
                        <option value="MD">Maryland</option>
                        <option value="MA">Massachusetts</option>
                        <option value="MI">Michigan</option>
                        <option value="MN">Minnesota</option>
                        <option value="MS">Mississippi</option>
                        <option value="MO">Missouri</option>
                        <option value="MT">Montana</option>
                        <option value="NE">Nebraska</option>
                        <option value="NV">Nevada</option>
                        <option value="NH">New Hampshire</option>
                        <option value="NJ">New Jersey</option>
                        <option value="NM">New Mexico</option>
                        <option value="NY">New York</option>
                        <option value="NC">North Carolina</option>
                        <option value="ND">North Dakota</option>
                        <option value="OH">Ohio</option>
                        <option value="OK">Oklahoma</option>
                        <option value="OR">Oregon</option>
                        <option value="PA">Pennsylvania</option>
                        <option value="RI">Rhode Island</option>
                        <option value="SC">South Carolina</option>
                        <option value="SD">South Dakota</option>
                        <option value="TN">Tennessee</option>
                        <option value="TX">Texas</option>
                        <option value="UT">Utah</option>
                        <option value="VT">Vermont</option>
                        <option value="VA">Virginia</option>
                        <option value="WA">Washington</option>
                        <option value="WV">West Virginia</option>
                        <option value="WI">Wisconsin</option>
                        <option value="WY">Wyoming</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="zipCode">ZIP Code *</label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                        placeholder="10001"
                      />
                    </div>
                  </div>

                  <div className="form-options">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="saveInfo"
                        checked={formData.saveInfo}
                        onChange={handleInputChange}
                      />
                      <span className="checkmark"></span>
                      Save this information for next time
                    </label>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="form-section">
                  <h2>Payment Method</h2>

                  <div className="payment-methods">
                    <div className="payment-option">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={paymentMethod === "cod"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <span className="radio-mark"></span>
                        <div className="payment-info">
                          <div className="payment-title">
                            <span>Cash on Delivery</span>
                            <div className="payment-icons">
                              <span className="cod-icon">💵</span>
                            </div>
                          </div>
                          <p className="payment-description">
                            Pay with cash when your order is delivered to your doorstep.
                          </p>
                        </div>
                      </label>
                    </div>

                    <div className="payment-option">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="stripe"
                          checked={paymentMethod === "stripe"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <span className="radio-mark"></span>
                        <div className="payment-info">
                          <div className="payment-title">
                            <span>Credit Card</span>
                            <div className="payment-icons">
                              <span className="card-icon">💳</span>
                              <span className="stripe-text">Stripe</span>
                            </div>
                          </div>
                          <p className="payment-description">
                            Pay securely with your credit or debit card via Stripe.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {paymentMethod === "stripe" && (
                    <div className="stripe-checkout-info">
                      {!isFormValid() && (
                        <div className="form-validation-error">
                          <p>⚠️ Please fill in all required fields above before proceeding with payment.</p>
                        </div>
                      )}
                      {isFormValid() && (
                        <div className="stripe-checkout-ready">
                          <div className="checkout-info">
                            <h4>🔒 Secure Stripe Checkout</h4>
                            <p>
                              Click &quot;Pay with Stripe&quot; below to be redirected to Stripe&apos;s
                              secure payment page where you can:
                            </p>
                            <ul>
                              <li>✅ Enter your card details securely</li>
                              <li>✅ Review your order total (${total.toFixed(2)})</li>
                              <li>✅ Complete your payment safely</li>
                            </ul>
                            <p className="note">
                              You&apos;ll be redirected back here after payment completion.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {paymentStatus === "cancelled" && (
                    <div className="payment-cancelled">
                      <p>
                        ⚠️ Payment was cancelled. You can try again or choose a different payment method.
                      </p>
                    </div>
                  )}
                </div>

                {/* Special Instructions */}
                <div className="form-section">
                  <h2>Special Instructions</h2>
                  <div className="form-group">
                    <label htmlFor="specialInstructions">Order Notes (Optional)</label>
                    <textarea
                      id="specialInstructions"
                      name="specialInstructions"
                      value={formData.specialInstructions}
                      onChange={handleInputChange}
                      placeholder="Any special instructions for your order..."
                      rows="4"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Right Column - Order Summary */}
            <div className="col-lg-5">
              <div className="order-summary">
                <h2>Order Summary</h2>

                <div className="order-items">
                  {cartItems.map((item) => (
                    <div key={item.id} className="order-item">
                      <div className="item-image">
                        <Image
                          src="/1_08ff09db-b9b0-4781-8774-8c5872176160_360x.webp"
                          alt={item.name}
                          width={60}
                          height={60}
                        />
                        <span className="item-quantity">{item.quantity}</span>
                      </div>
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <p>TAG ACE • 100ML</p>
                      </div>
                      <div className="item-price">
                        ${(getNumericPrice(item.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-totals">
                  <div className="total-row">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="total-row">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="total-row">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="total-row total-final">
                    <span>Total</span>
                    <span>${total.toFixed(2)} USD</span>
                  </div>
                </div>

                {paymentMethod === "cod" && (
                  <button
                    type="submit"
                    form="checkout-form"
                    className="complete-order-btn"
                    disabled={isLoading}
                    onClick={handleSubmit}
                  >
                    {isLoading ? (
                      <span className="loading-spinner"></span>
                    ) : (
                      <>
                        Complete Order
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="9,18 15,12 9,6"></polyline>
                        </svg>
                      </>
                    )}
                  </button>
                )}

                {paymentMethod === "stripe" && (
                  <button
                    type="button"
                    className="stripe-checkout-btn"
                    disabled={isLoading || !isFormValid()}
                    onClick={handleStripeCheckout}
                  >
                    {isLoading ? (
                      <span className="loading-spinner"></span>
                    ) : !isFormValid() ? (
                      "Complete Form First"
                    ) : (
                      <>
                        Pay with Stripe (${total.toFixed(2)})
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M7 7h10v10"></path>
                          <path d="M7 17L17 7"></path>
                        </svg>
                      </>
                    )}
                  </button>
                )}

                <div className="security-badges">
                  <div className="security-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <circle cx="12" cy="16" r="1"></circle>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <span>Secure Checkout</span>
                  </div>
                  <div className="security-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4"></path>
                      <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                      <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                    </svg>
                    <span>SSL Protected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
