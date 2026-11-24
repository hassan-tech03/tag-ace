import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Order Confirmation", path: "/order-confirmation", noindex: true });

export default function Layout({ children }) {
  return children;
}
