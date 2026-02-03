// API endpoints
export const API_ENDPOINTS = {
  PRODUCTS: '/api/products',
  CART: '/api/cart',
  ORDERS: '/api/orders',
  USERS: '/api/users',
};

// App configuration
export const APP_CONFIG = {
  APP_NAME: 'TagAce Perfumes',
  APP_DESCRIPTION: 'Discover your signature scent with premium fragrances',
  CURRENCY: 'USD',
  TAX_RATE: 0.1, // 10%
  SHIPPING_RATE: 5.99,
  FREE_SHIPPING_THRESHOLD: 75.00,
};

// Navigation links
export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Fragrances' },
  { href: '/contact', label: 'Contact' },
];

// Perfume categories
export const PERFUME_CATEGORIES = [
  { id: 'women', name: "Women's Perfumes", description: 'Elegant and sophisticated scents' },
  { id: 'men', name: "Men's Cologne", description: 'Bold and distinctive fragrances' },
  { id: 'unisex', name: 'Unisex Fragrances', description: 'Versatile scents for everyone' },
  { id: 'luxury', name: 'Luxury Collection', description: 'Premium and exclusive fragrances' },
  { id: 'oriental', name: 'Oriental', description: 'Rich and exotic scents' },
  { id: 'fresh', name: 'Fresh & Aquatic', description: 'Light and refreshing fragrances' },
];

// Fragrance families
export const FRAGRANCE_FAMILIES = [
  'Floral',
  'Oriental',
  'Woody',
  'Fresh',
  'Citrus',
  'Fruity',
  'Spicy',
  'Aquatic',
  'Gourmand',
  'Chypre'
];