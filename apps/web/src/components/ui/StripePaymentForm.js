'use client';

import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

export default function StripePaymentForm({ 
  onPaymentSuccess, 
  onPaymentError, 
  isLoading, 
  setIsLoading,
  customerInfo,
  formValid = true
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      return;
    }

    if (!formValid) {
      setMessage('Please fill in all required fields above before proceeding with payment.');
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
          payment_method_data: {
            billing_details: {
              name: `${customerInfo.firstName} ${customerInfo.lastName}`,
              email: customerInfo.email,
              phone: customerInfo.phone,
              address: {
                line1: customerInfo.address,
                line2: customerInfo.apartment || '',
                city: customerInfo.city,
                state: customerInfo.state,
                postal_code: customerInfo.zipCode,
                country: 'US',
              },
            },
          },
        },
        redirect: 'if_required',
      });

      if (error) {
        if (error.type === 'card_error' || error.type === 'validation_error') {
          setMessage(error.message);
        } else {
          setMessage('An unexpected error occurred.');
        }
        onPaymentError(error);
      } else {
        // Payment succeeded
        onPaymentSuccess();
      }
    } catch (err) {
      console.error('Payment error:', err);
      setMessage('Payment failed. Please try again.');
      onPaymentError(err);
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-payment-form">
      <PaymentElement 
        options={{
          layout: 'tabs',
          defaultValues: {
            billingDetails: {
              name: `${customerInfo.firstName} ${customerInfo.lastName}`,
              email: customerInfo.email,
              phone: customerInfo.phone,
              address: {
                line1: customerInfo.address,
                line2: customerInfo.apartment || '',
                city: customerInfo.city,
                state: customerInfo.state,
                postal_code: customerInfo.zipCode,
                country: 'US',
              },
            },
          },
        }}
      />
      
      {message && (
        <div className="payment-message error">
          {message}
        </div>
      )}
      
      <button 
        type="submit" 
        disabled={isLoading || !stripe || !elements || !formValid}
        className="stripe-pay-button"
      >
        {isLoading ? (
          <span className="loading-spinner"></span>
        ) : !formValid ? (
          'Complete Form First'
        ) : (
          'Pay Now'
        )}
      </button>
    </form>
  );
}