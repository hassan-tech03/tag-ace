ALTER TABLE "settings" ALTER COLUMN "store_info" SET DEFAULT '{"name":"Mushk Perfumes","tagline":"","email":"mushk.scents1@gmail.com","phone":"0306 9167328","address":""}'::jsonb;--> statement-breakpoint
-- Set the support phone on the existing settings row (only if none is set).
UPDATE "settings" SET "store_info" = jsonb_set("store_info", '{phone}', '"0306 9167328"'::jsonb, true), "updated_at" = now() WHERE coalesce("store_info"->>'phone', '') = '';
