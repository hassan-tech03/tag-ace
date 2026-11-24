import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Shop All Perfumes", path: "/shop", description: "Shop Mushk Perfumes' full collection of men's and women's fragrances in Pakistan: oud, floral, woody, fresh and oriental perfumes. Cash on Delivery and free delivery over Rs 5,000." });

export default function Layout({ children }) {
  return children;
}
