import Link from "next/link";
import PageHeader from "@/components/admin/ui/PageHeader";
import { Button } from "@/components/admin/ui/Field";
import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <PageHeader title="New product" description="Create a new product in your catalog.">
        <Link href="/admin/products">
          <Button variant="secondary">← Back to products</Button>
        </Link>
      </PageHeader>
      <ProductForm />
    </div>
  );
}
