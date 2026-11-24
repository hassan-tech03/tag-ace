import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Your Cart", path: "/cart", noindex: true });

export default function Layout({ children }) {
  return children;
}
