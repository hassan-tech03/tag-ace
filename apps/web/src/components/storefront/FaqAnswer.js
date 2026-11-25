import Link from "next/link";
import EmailLink from "./EmailLink";

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

  // Email addresses are rendered client-side (see EmailLink).
  const withEmails = [];
  parts.forEach((part) => {
    if (typeof part !== "string") return withEmails.push(part);
    part.split(/([\w.+-]+@[\w-]+\.[\w.]+)/).forEach((chunk, j) => {
      if (/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(chunk)) withEmails.push(<EmailLink key={`e${i++}-${j}`} email={chunk} />);
      else if (chunk) withEmails.push(chunk);
    });
  });
  return <p className={["faq-rich", className].filter(Boolean).join(" ")}>{withEmails}</p>;
}
