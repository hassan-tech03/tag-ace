import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import PageHeader from "@/components/admin/ui/PageHeader";
import { Button } from "@/components/admin/ui/Field";
import PostForm from "@/components/admin/PostForm";
import { db, posts } from "@mushk/db";
import { isUuid, serialize } from "@mushk/db/helpers";
import Arrow from '@/components/ui/Arrow';

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }) {
  if (!isUuid(params.id)) notFound();
  const [row] = await db.select().from(posts).where(eq(posts.id, params.id));
  if (!row) notFound();

  const initial = JSON.parse(JSON.stringify(serialize(row)));

  return (
    <div>
      <PageHeader title="Edit post" description={initial.title}>
        <Link href="/admin/blog">
          <Button variant="secondary"><Arrow dir="left" /> Back to blog</Button>
        </Link>
      </PageHeader>
      <PostForm initial={initial} postId={params.id} />
    </div>
  );
}
