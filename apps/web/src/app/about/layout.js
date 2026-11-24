import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "About Us", path: "/about", description: "The story behind Mushk Perfumes: premium fragrances for men and women, crafted to be long-lasting and loved, delivered across Pakistan." });

export default function Layout({ children }) {
  return children;
}
