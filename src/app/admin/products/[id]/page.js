import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/ui/PageHeader";
import { Button } from "@/components/admin/ui/Field";
import ProductForm from "@/components/admin/ProductForm";
import { dbConnect } from "@/lib/mongodb";
import Product from "@/lib/models/Product";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }) {
  await dbConnect();
  let doc = null;
  try {
    doc = await Product.findById(params.id).lean();
  } catch {
    // Invalid ObjectId etc.
    notFound();
  }
  if (!doc) notFound();

  const initial = JSON.parse(JSON.stringify(doc));

  return (
    <div>
      <PageHeader title="Edit product" description={initial.name}>
        <Link href="/admin/products">
          <Button variant="secondary">← Back to products</Button>
        </Link>
      </PageHeader>
      <ProductForm initial={initial} productId={params.id} />
    </div>
  );
}
