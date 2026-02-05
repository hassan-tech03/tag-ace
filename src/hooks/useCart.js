'use client';

import { useState, useEffect } from 'react';

export const useCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(Array.isArray(parsedCart) ? parsedCart : []);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading cart from localStorage:', error);
      }
      setCartItems([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes (only after initial load)
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('cart', JSON.stringify(cartItems));
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error saving cart to localStorage:', error);
        }
      }
    }
  }, [cartItems, isLoaded]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    console.log('Clearing cart...'); // Debug log
    setCartItems([]);
    // Force localStorage update
    try {
      localStorage.setItem('cart', JSON.stringify([]));
      console.log('Cart cleared successfully'); // Debug log
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // Helper function to extract numeric price from string or number
  const getNumericPrice = (price) => {
    if (typeof price === 'number') {
      return price;
    }
    if (typeof price === 'string') {
      // Extract number from strings like "$45.00", "From $79.00", etc.
      const match = price.match(/[\d.]+/);
      return match ? parseFloat(match[0]) : 0;
    }
    return 0;
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const numericPrice = getNumericPrice(item.price);
      return total + (numericPrice * item.quantity);
    }, 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    isLoaded,
  };
};