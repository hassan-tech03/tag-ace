// Single source of truth for the categories the storefront actually has
// routes for and the fragrance families the admin can assign. Anything that
// needs to know about either side should import from here so the dashboard
// stays aligned with the live storefront.

// The three top-level categories also act as the storefront URL slugs:
//   /shop/men   /shop/women   /shop/unisex
// The Best Sellers tabs on the homepage use the same slugs.
export const STORE_CATEGORIES = [
  { slug: "men", name: "Men's Fragrances", order: 1 },
  { slug: "women", name: "Women's Fragrances", order: 2 },
  { slug: "unisex", name: "Unisex", order: 3 },
];

// Olfactive families used both in the admin product form's dropdown AND as
// the sub-filter on each shop/[gender] page.
export const FRAGRANCE_FAMILIES = [
  "Floral",
  "Oriental",
  "Woody",
  "Fresh",
  "Citrus",
  "Fruity",
  "Spicy",
  "Aquatic",
  "Gourmand",
  "Chypre",
];
