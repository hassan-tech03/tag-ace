// Mushk Perfumes catalogue (15 SKUs, Nov 2026): 10 men's/unisex (Set 1) and
// 5 women's/unisex (Set 2). Images are Cloudinary uploads cut from the
// client's product posters: [square product shot, full poster].
// Order = display order (newest first) for the storefront's created-at sort.
// Seed with: npm run seed:catalog            (upsert)
//            node packages/db/scripts/seed-catalog.mjs --prune (also delete anything else)

export const CATALOG_DEFAULTS = {
  brand: "Mushk Perfumes",
  price: 2999, // PKR
  size: "50ml",
  stock: 20,
};

export const CATALOG = [
  {
    "name": "Monark",
    "slug": "monark",
    "sku": "MSK-M01",
    "category": "men",
    "fragranceFamily": "Woody",
    "tagline": "Crowned in confidence",
    "character": [
      "Smoky",
      "Woody",
      "Regal"
    ],
    "lead": "A smoky, woody fragrance with a regal edge, made for the moments you want to own the room.",
    "isNewArrival": true,
    "images": [
      "https://res.cloudinary.com/dfy225ucr/image/upload/v1795606640/mushk/products/monark.jpg",
      "https://res.cloudinary.com/dfy225ucr/image/upload/v1795606639/mushk/products/monark-poster.jpg"
    ]
  },
  {
    "name": "Phantom",
    "slug": "phantom",
    "sku": "MSK-M05",
    "category": "men",
    "fragranceFamily": "Oriental",
    "tagline": "A scent of mystery",
    "character": [
      "Deep oud",
      "Smoky",
      "Unforgettable"
    ],
    "lead": "Deep oud and soft smoke come together in a mysterious, unforgettable trail.",
    "isNewArrival": true,
    "images": [
      "https://res.cloudinary.com/dfy225ucr/image/upload/v1795606642/mushk/products/phantom.jpg",
      "https://res.cloudinary.com/dfy225ucr/image/upload/v1795606641/mushk/products/phantom-poster.jpg"
    ]
  },
  {
    "name": "Eternal",
    "slug": "eternal",
    "sku": "MSK-M06",
    "category": "men",
    "fragranceFamily": "Spicy",
    "tagline": "A fragrance that stays",
    "character": [
      "Bold notes",
      "Warm spice",
      "Lasting impression"
    ],
    "lead": "Bold notes and warm spice, built to leave a lasting impression.",
    "isNewArrival": true,
    "images": [
      "https://res.cloudinary.com/dfy225ucr/image/upload/v1795606631/mushk/products/eternal.jpg",
      "https://res.cloudinary.com/dfy225ucr/image/upload/v1795606630/mushk/products/eternal-poster.jpg"
    ]
  },
  {
    "name": "Executive",
    "slug": "executive",
    "sku": "MSK-M08",
    "category": "men",
    "fragranceFamily": "Citrus",
    "tagline": "Defined by presence",
    "character": [
      "Citrus",
      "Woody",
      "Refined"
    ],
    "lead": "Bright citrus over refined woods: a polished scent for the office and beyond.",
    "isNewArrival": true,
    "images": [
      "https://res.cloudinary.com/dfy225ucr/image/upload/v1795606633/mushk/products/executive.jpg",
      "https://res.cloudinary.com/dfy225ucr/image/upload/v1795606631/mushk/products/executive-poster.jpg"
    ]
  },
  {
    "name": "Mid Night",
    "slug": "mid-night",
    "sku": "MSK-M02",
    "category": "men",
    "fragranceFamily": "Spicy",
    "tagline": "Own the darkness",
    "character": [
      "Spicy",
      "Warm amber",
      "Magnetic"
    ],
    "lead": "A spicy evening scent wrapped in warm amber, magnetic and made for after dark.",
    "isNewArrival": false,
    "images": [
      "https://res.cloudinary.com/dfy225ucr/image/upload/v1795606638/mushk/products/mid-night.jpg",
      "https://res.cloudinary.com/dfy225ucr/image/upload/v1795606637/mushk/products/mid-night-poster.jpg"
    ]
  },
  {
    "name": "Guilty",
    "slug": "guilty",
    "sku": "MSK-M03",
    "category": "men",
    "fragranceFamily": "Woody",
    "tagline": "Unapologetically bold",
    "character": [
      "Aromatic",
      "Woody",
      "Seductive"
    ],
    "lead": "An aromatic, woody fragrance with a seductive streak, for those who never ask permission.",
    "isNewArrival": false,
    "images": [
      "https://res.cloudinary.com/dfy225ucr/image/upload/v1795606634/mushk/products/guilty.jpg",
      "https://res.cloudinary.com/dfy225ucr/image/upload/v1795606633/mushk/products/guilty-poster.jpg"
    ]
  },
  {
    "name": "Rouge",
    "slug": "rouge",
    "sku": "MSK-M04",
    "category": "men",
    "fragranceFamily": "Oriental",
    "tagline": "A radiant signature",
    "character": [
      "Saffron",
      "Amberwood",
      "Luminous"
    ],
    "lead": "Saffron and amberwood meet in a luminous, radiant trail that becomes your signature.",
    "isNewArrival": false,
    "images": [
      "https://res.cloudinary.com/dfy225ucr/image/upload/v1795606643/mushk/products/rouge.jpg",
      "https://res.cloudinary.com/dfy225ucr/image/upload/v1795606642/mushk/products/rouge-poster.jpg"
    ]
  },
  {
    "name": "Sailer",
    "slug": "sailer",
    "sku": "MSK-M07",
    "category": "men",
    "fragranceFamily": "Aquatic",
    "tagline": "Chart your own course",
    "character": [
      "Fresh",
      "Aromatic",
      "Adventurous"
    ],
    "lead": "A fresh, aromatic scent with an adventurous spirit, crisp as an open-sea breeze.",
    "isNewArrival": false,
    "images": [
      "https://res.cloudinary.com/dfy225ucr/image/upload/v1795606645/mushk/products/sailer.jpg",
      "https://res.cloudinary.com/dfy225ucr/image/upload/v1795606644/mushk/products/sailer-poster.jpg"
    ]
  },
  {
    "name": "Icon",
    "slug": "icon",
    "sku": "MSK-M09",
    "category": "men",
    "fragranceFamily": "Fresh",
    "tagline": "Timeless by nature",
    "character": [
      "Crisp",
      "Fougere",
      "Classic"
    ],
    "lead": "A crisp, classic fougere: clean, timeless and effortlessly confident.",
    "isNewArrival": false,
    "images": [
      "https://res.cloudinary.com/dfy225ucr/image/upload/v1795606636/mushk/products/icon.jpg",
      "https://res.cloudinary.com/dfy225ucr/image/upload/v1795606635/mushk/products/icon-poster.jpg"
    ]
  },
  {
    "name": "Sporty",
    "slug": "sporty",
    "sku": "MSK-M10",
    "category": "men",
    "fragranceFamily": "Fresh",
    "tagline": "Pure fresh energy",
    "character": [
      "Crisp",
      "Energetic",
      "Clean"
    ],
    "lead": "Crisp, clean and full of energy, an easy everyday scent for active days.",
    "isNewArrival": false,
    "images": [
      "https://res.cloudinary.com/dfy225ucr/image/upload/v1795606646/mushk/products/sporty.jpg",
      "https://res.cloudinary.com/dfy225ucr/image/upload/v1795606645/mushk/products/sporty-poster.jpg"
    ]
  },
  {
    "name": "Velvet Bloom",
    "slug": "velvet-bloom",
    "sku": "MSK-W02",
    "category": "women",
    "fragranceFamily": "Floral",
    "tagline": "A fragrance that turns heads",
    "character": [
      "Floral",
      "Fruity",
      "Irresistible"
    ],
    "lead": "A floral, fruity fragrance that is bright, playful and impossible to ignore.",
    "isNewArrival": true,
    "images": [
      "https://res.cloudinary.com/dfy225ucr/image/upload/v1795606649/mushk/products/velvet-bloom.jpg",
      "https://res.cloudinary.com/dfy225ucr/image/upload/v1795606649/mushk/products/velvet-bloom-poster.jpg"
    ]
  },
  {
    "name": "Amber Spice",
    "slug": "amber-spice",
    "sku": "MSK-W01",
    "category": "women",
    "fragranceFamily": "Oriental",
    "tagline": "Warmth in every drop",
    "character": [
      "Warm amber",
      "Spiced vanilla",
      "Alluring"
    ],
    "lead": "Warm amber and spiced vanilla in an alluring, cosy blend.",
    "isNewArrival": true,
    "images": [
      "https://res.cloudinary.com/dfy225ucr/image/upload/v1795606626/mushk/products/amber-spice.jpg",
      "https://res.cloudinary.com/dfy225ucr/image/upload/v1795606626/mushk/products/amber-spice-poster.jpg"
    ]
  },
  {
    "name": "Crystal",
    "slug": "crystal",
    "sku": "MSK-W05",
    "category": "women",
    "fragranceFamily": "Floral",
    "tagline": "Pure luminous grace",
    "character": [
      "Fresh floral",
      "Radiant",
      "Elegant"
    ],
    "lead": "A fresh floral with radiant, elegant clarity.",
    "isNewArrival": true,
    "images": [
      "https://res.cloudinary.com/dfy225ucr/image/upload/v1795606628/mushk/products/crystal.jpg",
      "https://res.cloudinary.com/dfy225ucr/image/upload/v1795606627/mushk/products/crystal-poster.jpg"
    ]
  },
  {
    "name": "Sunset Island",
    "slug": "sunset-island",
    "sku": "MSK-W03",
    "category": "women",
    "fragranceFamily": "Fruity",
    "tagline": "Golden hour captured",
    "character": [
      "Tropical",
      "Radiant",
      "Breezy"
    ],
    "lead": "A tropical, breezy scent that captures the warm glow of golden hour.",
    "isNewArrival": true,
    "images": [
      "https://res.cloudinary.com/dfy225ucr/image/upload/v1795606648/mushk/products/sunset-island.jpg",
      "https://res.cloudinary.com/dfy225ucr/image/upload/v1795606648/mushk/products/sunset-island-poster.jpg"
    ]
  },
  {
    "name": "Dream Escape",
    "slug": "dream-escape",
    "sku": "MSK-W04",
    "category": "women",
    "fragranceFamily": "Floral",
    "tagline": "Lost in petals",
    "character": [
      "Soft floral",
      "Romantic",
      "Ethereal"
    ],
    "lead": "A soft, romantic floral, light and ethereal.",
    "isNewArrival": false,
    "images": [
      "https://res.cloudinary.com/dfy225ucr/image/upload/v1795606629/mushk/products/dream-escape.jpg",
      "https://res.cloudinary.com/dfy225ucr/image/upload/v1795606629/mushk/products/dream-escape-poster.jpg"
    ]
  }
];
