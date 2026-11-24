import Link from "next/link";

// Renders an FAQ answer, turning "[text](/path)" into links.
export default function FaqAnswer({ text, className }) {
  const parts = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const href = m[2];
    parts.push(
      href.startsWith("/") ? (
        <Link key={i++} href={href}>
          {m[1]}
        </Link>
      ) : (
        <a key={i++} href={href} target="_blank" rel="noopener noreferrer">
          {m[1]}
        </a>
      )
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <p className={className}>{parts}</p>;
}
