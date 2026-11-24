CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text DEFAULT '' NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"cover_image" text DEFAULT '' NOT NULL,
	"author" text DEFAULT 'Mushk Perfumes' NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "posts_slug_unique" ON "posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "posts_status_published_idx" ON "posts" USING btree ("status","published_at");