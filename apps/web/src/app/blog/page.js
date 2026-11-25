import Link from "next/link";
import { and, desc, eq, isNotNull, lte } from "drizzle-orm";
import { db, posts } from "@mushk/db";
import { formatPostDate, readingMinutes } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";
import Arrow from '@/components/ui/Arrow';

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Perfume Blog: Guides & Tips",
  description:
    "Perfume guides and tips from Mushk Perfumes: how to choose a signature scent, make fragrance last in Pakistan's heat, oud, attar, layering and gifting.",
  path: "/blog",
});

async function getPublishedPosts() {
  return db
    .select({
      slug: posts.slug,
      title: posts.title,
      excerpt: posts.excerpt,
      coverImage: posts.coverImage,
      tags: posts.tags,
      publishedAt: posts.publishedAt,
      content: posts.content,
    })
    .from(posts)
    .where(and(eq(posts.status, "published"), isNotNull(posts.publishedAt), lte(posts.publishedAt, new Date())))
    .orderBy(desc(posts.publishedAt));
}

function Cover({ src, alt, className }) {
  if (!src) return <div className={`blog-cover blog-cover--empty ${className || ""}`} aria-hidden="true" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={`blog-cover ${className || ""}`} loading="lazy" />;
}

export default async function BlogPage() {
  const list = await getPublishedPosts();
  const [featured, ...rest] = list;

  return (
    <div className="blog-page">
      <section className="page-header blog-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>Blog</span>
          </div>
          <h1>The Mushk Journal</h1>
          <p>Fragrance guides, tips and stories to help you find, wear and love your scent.</p>
        </div>
      </section>

      <div className="container blog-container">
        {list.length === 0 ? (
          <div className="empty-state">
            <h3>No articles yet</h3>
            <p>New articles are on their way. Check back soon.</p>
          </div>
        ) : (
          <>
            {featured && (
              <Link href={`/blog/${featured.slug}`} className="blog-featured">
                <div className="blog-featured__media">
                  <Cover src={featured.coverImage} alt={featured.title} />
                </div>
                <div className="blog-featured__body">
                  <div className="blog-meta">
                    {featured.tags?.[0] && <span className="blog-tag">{featured.tags[0]}</span>}
                    <span>{formatPostDate(featured.publishedAt)}</span>
                    <span>·</span>
                    <span>{readingMinutes(featured.content)} min read</span>
                  </div>
                  <h2>{featured.title}</h2>
                  <p>{featured.excerpt}</p>
                  <span className="blog-readmore with-arrow">Read article <Arrow /></span>
                </div>
              </Link>
            )}

            {rest.length > 0 && (
              <div className="blog-grid">
                {rest.map((p) => (
                  <Link key={p.slug} href={`/blog/${p.slug}`} className="blog-card">
                    <div className="blog-card__media">
                      <Cover src={p.coverImage} alt={p.title} />
                    </div>
                    <div className="blog-card__body">
                      <div className="blog-meta">
                        {p.tags?.[0] && <span className="blog-tag">{p.tags[0]}</span>}
                        <span>{readingMinutes(p.content)} min read</span>
                      </div>
                      <h3>{p.title}</h3>
                      <p>{p.excerpt}</p>
                      <span className="blog-card__date">{formatPostDate(p.publishedAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
