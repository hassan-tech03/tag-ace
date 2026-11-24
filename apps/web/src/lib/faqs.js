// Store FAQs: one source for /faq, the Shipping & Returns page, the product
// page and the contact page. Answers may contain [text](/path) links.
//
// Values that the admin can change (delivery charge, free-delivery
// threshold, support email/phone) are filled in from settings via
// buildFaqs(ctx), so the answers never go stale.

import { formatPrice } from "@/lib/money";

export const DELIVERY_TIME = {
  majorCities: "2–4 working days",
  otherCities: "3–6 working days",
  majorCityNames: "Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan and Peshawar",
};

export const RETURN_REPORT_WINDOW = "48 hours";

function deliveryCostText({ freeShippingThreshold, flatRate }) {
  if (!(flatRate > 0)) return "Delivery is free on every order.";
  if (freeShippingThreshold > 0) {
    return `Delivery is free on orders of ${formatPrice(freeShippingThreshold)} or more. Below that, a flat delivery charge of ${formatPrice(flatRate)} applies anywhere in Pakistan.`;
  }
  return `A flat delivery charge of ${formatPrice(flatRate)} applies anywhere in Pakistan.`;
}

function contactText({ email, phone }) {
  const parts = [];
  if (email) parts.push(`email ${email}`);
  if (phone) parts.push(`call or WhatsApp ${phone}`);
  return parts.length ? parts.join(", or ") : "use our [contact page](/contact)";
}

// ctx: { rates: { freeShippingThreshold, flatRate }, email, phone }
export function buildFaqs(ctx = {}) {
  const rates = ctx.rates || { freeShippingThreshold: 5000, flatRate: 250 };
  const contact = contactText({ email: ctx.email, phone: ctx.phone });

  return [
    {
      id: "orders",
      title: "Orders & Payment",
      items: [
        {
          id: "how-to-order",
          q: "How do I place an order?",
          a: "Browse our [men's](/shop/men) or [women's](/shop/women) collection, add the fragrances you like to your cart and check out with your name, phone number and delivery address. You'll see your order number straight away and receive a confirmation email.",
        },
        {
          id: "payment-methods",
          q: "What payment methods do you accept?",
          a: "You can pay Cash on Delivery anywhere in Pakistan, or pay securely online by debit or credit card (Visa and Mastercard). Card payments are processed by Stripe; your card details never reach our servers.",
        },
        {
          id: "cod-confirmation",
          q: "Will you confirm my Cash on Delivery order?",
          a: "Yes. After you place a COD order, our team will call or WhatsApp you on the number you entered to confirm the order and address before it's dispatched. Please keep your phone reachable so there's no delay.",
        },
        {
          id: "change-cancel",
          q: "Can I change or cancel my order?",
          a: `Yes, as long as it hasn't been dispatched yet. Contact us as soon as possible with your order number: ${contact}.`,
        },
        {
          id: "order-email",
          q: "I didn't get a confirmation email. What should I do?",
          a: `Check your spam or promotions folder first. If it isn't there, the email address may have had a typo; ${contact} with your name and phone number and we'll confirm your order.`,
        },
      ],
    },
    {
      id: "delivery",
      title: "Delivery",
      items: [
        {
          id: "where-deliver",
          q: "Do you deliver all over Pakistan?",
          a: "Yes, we deliver to cities and towns across Pakistan through our courier partners.",
        },
        {
          id: "delivery-time",
          q: "How long does delivery take?",
          a: `Orders to major cities (${DELIVERY_TIME.majorCityNames}) usually arrive in ${DELIVERY_TIME.majorCities}; other cities and towns take ${DELIVERY_TIME.otherCities}. Times start once your order is confirmed and can be longer during sales, public holidays or bad weather.`,
        },
        {
          id: "delivery-cost",
          q: "How much does delivery cost?",
          a: deliveryCostText(rates),
        },
        {
          id: "order-status",
          q: "How do I know where my order is?",
          a: `We email you when your order is placed and again when it's delivered. For an update in between, ${contact} with your order number.`,
        },
        {
          id: "international",
          q: "Do you ship outside Pakistan?",
          a: "Not yet. We currently deliver within Pakistan only.",
        },
      ],
    },
    {
      id: "returns",
      title: "Returns & Exchanges",
      items: [
        {
          id: "return-policy",
          q: "What is your return policy?",
          a: "Perfume is a personal-care product, so for hygiene reasons we can't accept returns of opened or used fragrances, or returns because a scent wasn't to your taste. If your order arrives damaged, leaking or is not what you ordered, we'll replace it or refund you. See [Shipping & Returns](/shipping-returns) for the full policy.",
        },
        {
          id: "damaged-item",
          q: "My bottle arrived damaged, leaking or wrong. What should I do?",
          a: `Report it within ${RETURN_REPORT_WINDOW} of delivery: ${contact}. Include your order number, photos, and an unboxing video recorded in one take from the sealed parcel. Once we've checked it, we'll send a replacement or arrange a refund.`,
        },
        {
          id: "refunds",
          q: "How do refunds work?",
          a: "Approved refunds for card payments go back to the same card; your bank may take 5–10 working days to show it. For Cash on Delivery orders we'll arrange the refund to your bank account or mobile wallet.",
        },
      ],
    },
    {
      id: "products",
      title: "Our Fragrances",
      items: [
        {
          id: "original",
          q: "Are Mushk perfumes original?",
          a: "Yes. Every fragrance is Mushk's own original blend, created for our brand. They aren't copies of other brands.",
        },
        {
          id: "longevity",
          q: "How long will the fragrance last?",
          a: "It depends on the fragrance, your skin and the weather. Richer scents like oud and amber last longest, fresh citrus scents are lighter. For more staying power, spray on moisturised skin and on pulse points. Our guide on [making perfume last longer in summer](/blog/make-perfume-last-longer-in-summer) has more tips.",
        },
        {
          id: "choose",
          q: "How do I choose the right fragrance?",
          a: "Start with the fragrance families you naturally enjoy (fresh, floral, woody or oriental) and use the Fragrance Family filter on our shop pages. Read [how to find your signature scent](/blog/how-to-find-your-signature-scent) and [fragrance families explained](/blog/fragrance-families-explained) for help.",
        },
        {
          id: "concentrations",
          q: "What's the difference between EDP, EDT and attar?",
          a: "They differ in how much perfume oil they contain, which affects strength and longevity. Our guide [Parfum, EDP, EDT or attar?](/blog/parfum-edp-edt-or-attar) explains it simply.",
        },
        {
          id: "storage",
          q: "How should I store my perfume?",
          a: "Keep it in a cool, dark place with the cap on, away from sunlight, heat and bathroom steam. More in [how to store perfume](/blog/how-to-store-perfume).",
        },
        {
          id: "sensitive-skin",
          q: "Is it safe for sensitive skin?",
          a: "If you have sensitive skin or fragrance allergies, try a small amount on your inner wrist first and wait a day. Don't apply perfume to broken or irritated skin, and keep it away from your eyes.",
        },
      ],
    },
    {
      id: "contact",
      title: "Contact",
      items: [
        {
          id: "contact-us",
          q: "How can I contact you?",
          a: `${contact.charAt(0).toUpperCase()}${contact.slice(1)}. You can also send us a message through our [contact page](/contact). We reply as soon as we can.`,
        },
      ],
    },
  ];
}

export function findFaqs(groups, ids) {
  const all = groups.flatMap((g) => g.items);
  return ids.map((id) => all.find((f) => f.id === id)).filter(Boolean);
}

// Plain text for structured data: "[text](/path)" -> "text".
export function faqPlainText(answer) {
  return String(answer).replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
}

export function faqPageJsonLd(groups) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: groups.flatMap((g) =>
      g.items.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: faqPlainText(f.a) },
      }))
    ),
  };
}
