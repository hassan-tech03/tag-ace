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

  // Max units of a product the cart may hold: its stock when known.
  const maxFor = (item) => {
    const stock = Number(item?.stock);
    return Number.isFinite(stock) && stock > 0 ? stock : Infinity;
  };

  // Adds `quantity` units, capped at the product's stock. Returns
  // { quantity, capped, max } so callers can tell the shopper when the cap
  // was hit.
  const addToCart = (product, quantity = 1) => {
    const max = maxFor(product);
    const existing = cartItems.find((item) => item.id === product.id);
    const wanted = (existing?.quantity || 0) + quantity;
    const next = Math.min(wanted, max);
    const image = product.image || (Array.isArray(product.images) ? product.images[0] : "") || "";

    setCartItems((prevItems) => {
      const found = prevItems.find((item) => item.id === product.id);
      if (found) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, stock: product.stock ?? item.stock, quantity: Math.min(item.quantity + quantity, max) }
            : item
        );
      }
      return [...prevItems, { ...product, image, quantity: Math.min(quantity, max) }];
    });
    return { quantity: next, capped: wanted > max, max };
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
          item.id === productId ? { ...item, quantity: Math.min(quantity, maxFor(item)) } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
    // Force localStorage update
    try {
      localStorage.setItem('cart', JSON.stringify([]));
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