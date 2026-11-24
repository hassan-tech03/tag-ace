ALTER TABLE "settings" ALTER COLUMN "store_info" SET DEFAULT '{"name":"Mushk Perfumes","tagline":"","email":"mushk.scents1@gmail.com","phone":"","address":""}'::jsonb;--> statement-breakpoint
-- Set the support email on the existing settings row (only if none is set).
UPDATE "settings" SET "store_info" = jsonb_set("store_info", '{email}', '"mushk.scents1@gmail.com"'::jsonb, true), "updated_at" = now() WHERE coalesce("store_info"->>'email', '') = '';
