import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/ui/PageHeader";
import { Button } from "@/components/admin/ui/Field";
import ProductForm from "@/components/admin/ProductForm";
import { eq } from "drizzle-orm";
import { db, products } from "@/lib/db";
import { isUuid, serialize } from "@/lib/db/helpers";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }) {
  if (!isUuid(params.id)) notFound();
  const [row] = await db.select().from(products).where(eq(products.id, params.id));
  if (!row) notFound();

  const initial = JSON.parse(JSON.stringify(serialize(row)));

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
