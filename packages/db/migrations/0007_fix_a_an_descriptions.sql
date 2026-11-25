-- Grammar fix in product copy: "An floral ..." -> "A floral ..." (only when
-- the next word starts with a consonant). Runs once per database.
UPDATE "products"
SET "description" = regexp_replace("description", '\mAn ([b-df-hj-np-tv-zB-DF-HJ-NP-TV-Z])', 'A \1', 'g'),
    "short_description" = regexp_replace("short_description", '\mAn ([b-df-hj-np-tv-zB-DF-HJ-NP-TV-Z])', 'A \1', 'g'),
    "updated_at" = now()
WHERE "description" ~ '\mAn [b-df-hj-np-tv-zB-DF-HJ-NP-TV-Z]'
   OR "short_description" ~ '\mAn [b-df-hj-np-tv-zB-DF-HJ-NP-TV-Z]';
