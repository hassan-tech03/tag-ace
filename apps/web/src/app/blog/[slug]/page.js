import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq, isNotNull, lte, ne } from "drizzle-orm";
import { db, posts } from "@mushk/db";
import { formatPostDate, readingMinutes, renderMarkdown } from "@/lib/blog";

export const dynamic = "force-dynamic";

const published = () => and(eq(posts.status, "published"), isNotNull(posts.publishedAt), lte(posts.publishedAt, new Date()));

async function getPost(slug) {
  if (!/^[a-z0-9-]{1,200}$/.test(slug)) return null;
  const [row] = await db.select().from(posts).where(and(eq(posts.slug, slug), published()));
  return row || null;
}

export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  if (!post) return { title: "Article not found · Mushk Perfumes" };
  const images = post.coverImage ? [{ url: post.coverImage }] : undefined;
  return {
    title: `${post.title} · Mushk Perfumes`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt?.toISOString(),
      images,
    },
  };
}

export default async function BlogPostPage({ params }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const more = await db
    .select({ slug: posts.slug, title: posts.title, coverImage: posts.coverImage, publishedAt: posts.publishedAt })
    .from(posts)
    .where(and(published(), ne(posts.id, post.id)))
    .orderBy(desc(posts.publishedAt))
    .limit(3);

  const html = renderMarkdown(post.content);

  return (
    <div className="blog-post-page">
      <section className="page-header blog-post-header">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/blog">Blog</Link>
            <span>/</span>
            <span className="breadcrumb-current">{post.title}</span>
          </div>
          <div className="blog-meta blog-meta--center">
            {post.tags?.map((t) => (
              <span key={t} className="blog-tag">
                {t}
              </span>
            ))}
          </div>
          <h1>{post.title}</h1>
          <div className="blog-byline">
            <span>{post.author}</span>
            <span>·</span>
            <span>{formatPostDate(post.publishedAt)}</span>
            <span>·</span>
            <span>{readingMinutes(post.content)} min read</span>
          </div>
        </div>
      </section>

      <div className="container">
        <article className="blog-article">
          {post.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.coverImage} alt={post.title} className="blog-article__cover" />
          )}
          {post.excerpt && <p className="blog-article__lead">{post.excerpt}</p>}
          <div className="blog-prose" dangerouslySetInnerHTML={{ __html: html }} />

          <div className="blog-cta">
            <h3>Find your signature scent</h3>
            <p>Explore our collections for men and women, with Cash on Delivery available.</p>
            <div className="blog-cta__buttons">
              <Link href="/shop/men" className="blog-btn blog-btn--dark">
                Shop men
              </Link>
              <Link href="/shop/women" className="blog-btn blog-btn--light">
                Shop women
              </Link>
            </div>
          </div>
        </article>

        {more.length > 0 && (
          <section className="blog-more">
            <h2>More from the journal</h2>
            <div className="blog-grid blog-grid--compact">
              {more.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="blog-card">
                  <div className="blog-card__media">
                    {p.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.coverImage} alt={p.title} className="blog-cover" loading="lazy" />
                    ) : (
                      <div className="blog-cover blog-cover--empty" aria-hidden="true" />
                    )}
                  </div>
                  <div className="blog-card__body">
                    <h3>{p.title}</h3>
                    <span className="blog-card__date">{formatPostDate(p.publishedAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
