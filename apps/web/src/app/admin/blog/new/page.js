import Link from "next/link";
import PageHeader from "@/components/admin/ui/PageHeader";
import { Button } from "@/components/admin/ui/Field";
import PostForm from "@/components/admin/PostForm";
import Arrow from '@/components/ui/Arrow';

export default function NewPostPage() {
  return (
    <div>
      <PageHeader title="New post" description="Write a new article for the blog.">
        <Link href="/admin/blog">
          <Button variant="secondary"><Arrow dir="left" /> Back to blog</Button>
        </Link>
      </PageHeader>
      <PostForm />
    </div>
  );
}
