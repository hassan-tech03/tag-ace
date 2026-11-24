-- One-time data move from USD to PKR (the store now prices in rupees).
-- Product and coupon amounts are multiplied by 100 (e.g. $95 -> Rs 9,500),
-- and the shipping settings get the PKR defaults (Rs 250, free over Rs 5,000,
-- no tax). Drizzle records this migration, so it runs once per database.
-- Orders are left as they are: they keep the amounts they were placed with.
UPDATE "products"
SET "price" = round("price" * 100),
    "original_price" = CASE WHEN "original_price" IS NULL THEN NULL ELSE round("original_price" * 100) END,
    "updated_at" = now();
--> statement-breakpoint
UPDATE "coupons"
SET "value" = CASE WHEN "type" = 'fixed' THEN round(("value" * 100)::numeric)::double precision ELSE "value" END,
    "min_purchase" = round("min_purchase" * 100),
    "max_discount" = CASE WHEN "max_discount" IS NULL THEN NULL ELSE round("max_discount" * 100) END,
    "updated_at" = now();
--> statement-breakpoint
UPDATE "settings"
SET "shipping" = '{"freeShippingThreshold":5000,"flatRate":250,"taxRate":0}'::jsonb,
    "updated_at" = now();
