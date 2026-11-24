import nodemailer from "nodemailer";
import { getSettings } from "@mushk/db/queries";
import { formatPrice } from "@/lib/money";

// Outgoing email over SMTP (Gmail by default).
//
//   SMTP_USER / SMTP_PASS   Gmail address + 16-character App Password
//   SMTP_HOST / SMTP_PORT   default smtp.gmail.com:465 (SSL)
//   MAIL_FROM               default "Mushk Perfumes <SMTP_USER>"
//   ORDER_NOTIFY_EMAIL      who gets "new order" alerts; default: the store
//                           email from Admin -> Site Content, else SMTP_USER
//
// When SMTP isn't configured every send is skipped with a log line, so
// orders and the contact form never fail because of email.

const cache = (globalThis.__mushkMailer ??= { transport: null });

export function emailConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

function transport() {
  if (!cache.transport) {
    const port = Number(process.env.SMTP_PORT) || 465;
    cache.transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return cache.transport;
}

function fromAddress() {
  return process.env.MAIL_FROM || `Mushk Perfumes <${process.env.SMTP_USER}>`;
}

export async function sendMail({ to, subject, html, text, replyTo }) {
  if (!emailConfigured()) {
    console.warn(`[email] SMTP not configured; skipped "${subject}" to ${to}`);
    return { skipped: true };
  }
  const info = await transport().sendMail({ from: fromAddress(), to, subject, html, text, replyTo });
  return { messageId: info.messageId };
}

async function storeContact() {
  try {
    const s = await getSettings();
    return {
      name: s.storeInfo?.name || "Mushk Perfumes",
      email: s.storeInfo?.email || process.env.SMTP_USER || "",
      phone: s.storeInfo?.phone || "",
    };
  } catch {
    return { name: "Mushk Perfumes", email: process.env.SMTP_USER || "", phone: "" };
  }
}

// ---------------------------------------------------------------------------
// Templates

const esc = (v) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const C = { gold: "#c9a96e", ink: "#1a1a1a", muted: "#777777", line: "#ece5da", cream: "#faf7f2" };

function siteBase() {
  return (process.env.SITE_URL || process.env.NEXT_PUBLIC_DOMAIN || "").replace(/\/+$/, "");
}

function layout({ preheader, body }) {
  const base = siteBase();
  const logo = base
    ? `<img src="${base}/brand/mushk-logo.png" alt="Mushk Perfumes" width="110" style="display:block;margin:0 auto;height:auto;border:0" />`
    : `<div style="font-family:Georgia,serif;font-size:26px;color:${C.ink};letter-spacing:1px">MUSHK</div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${C.cream};">
<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream};padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid ${C.line};border-radius:14px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:${C.ink}">
<tr><td style="padding:28px 24px 18px;text-align:center;border-bottom:1px solid ${C.line}">${logo}</td></tr>
<tr><td style="padding:28px 28px 8px">${body}</td></tr>
<tr><td style="padding:20px 28px 26px;font-size:12px;line-height:1.6;color:${C.muted};text-align:center;border-top:1px solid ${C.line}">
Mushk Perfumes${base ? ` · <a href="${base}" style="color:${C.muted}">${esc(base.replace(/^https?:\/\//, ""))}</a>` : ""}
</td></tr>
</table>
</td></tr></table></body></html>`;
}

function itemsTable(items = []) {
  const rows = items
    .map(
      (it) => `<tr>
<td style="padding:10px 0;border-bottom:1px solid ${C.line};font-size:14px">${esc(it.name)}<div style="color:${C.muted};font-size:12px">Qty ${esc(it.quantity)} × ${esc(formatPrice(it.price))}</div></td>
<td style="padding:10px 0;border-bottom:1px solid ${C.line};font-size:14px;text-align:right;white-space:nowrap">${esc(formatPrice(Number(it.price) * Number(it.quantity)))}</td>
</tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>`;
}

function totalsTable(order) {
  const row = (label, value, strong) =>
    `<tr><td style="padding:4px 0;font-size:${strong ? 16 : 14}px;${strong ? "font-weight:bold;" : `color:${C.muted};`}">${label}</td><td style="padding:4px 0;text-align:right;font-size:${strong ? 16 : 14}px;${strong ? "font-weight:bold;" : ""}">${value}</td></tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px">
${row("Subtotal", esc(formatPrice(order.subtotal)))}
${row("Delivery", Number(order.shipping) > 0 ? esc(formatPrice(order.shipping)) : "Free")}
${Number(order.tax) > 0 ? row("Tax", esc(formatPrice(order.tax))) : ""}
${Number(order.discount) > 0 ? row("Discount", `− ${esc(formatPrice(order.discount))}`) : ""}
${row("Total", esc(formatPrice(order.total)), true)}
</table>`;
}

function addressHtml(a = {}) {
  return [a.line1, a.line2, [a.city, a.state].filter(Boolean).join(", "), a.zipCode, a.country]
    .filter((x) => x && String(x).trim())
    .map(esc)
    .join("<br>");
}

function addressText(a = {}) {
  return [a.line1, a.line2, [a.city, a.state].filter(Boolean).join(", "), a.zipCode, a.country]
    .filter((x) => x && String(x).trim())
    .join(", ");
}

const paymentLabel = (o) =>
  o.paymentMethod === "cod" ? "Cash on Delivery" : o.paymentStatus === "paid" ? "Card (paid)" : "Card";

function customerName(c = {}) {
  return [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
}

function customerEmailContent(order, store) {
  const c = order.customer || {};
  const name = customerName(c) || "there";
  const h = (t) => `<h2 style="font-size:15px;margin:22px 0 6px;color:${C.ink}">${t}</h2>`;
  const body = `
<p style="margin:0 0 6px;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;color:${C.gold};font-weight:bold">Order confirmed</p>
<h1 style="margin:0 0 12px;font-family:Georgia,serif;font-weight:normal;font-size:26px">Thank you, ${esc(name)}!</h1>
<p style="margin:0 0 6px;font-size:14px;line-height:1.7">We've received your order <strong>#${esc(order.orderNumber)}</strong> and will start preparing it shortly.${
    order.paymentMethod === "cod" ? ` Please keep <strong>${esc(formatPrice(order.total))}</strong> ready to pay on delivery.` : ""
  }</p>
${h("Your order")}
${itemsTable(order.items)}
${totalsTable(order)}
${h("Delivery address")}
<p style="margin:0;font-size:14px;line-height:1.6">${esc(customerName(c))}${c.phone ? `<br>${esc(c.phone)}` : ""}<br>${addressHtml(order.shippingAddress) || "—"}</p>
${h("Payment")}
<p style="margin:0;font-size:14px">${esc(paymentLabel(order))}</p>
<div style="margin:26px 0 8px;padding:16px;border-radius:10px;background:${C.cream};font-size:13px;line-height:1.6">
Questions about your order? Reply to this email${store.email ? ` or write to <a href="mailto:${esc(store.email)}" style="color:${C.ink}">${esc(store.email)}</a>` : ""}${
    store.phone ? `, or call ${esc(store.phone)}` : ""
  }. Please mention your order number.
</div>`;
  const text = [
    `Thank you, ${name}! Your Mushk Perfumes order #${order.orderNumber} is confirmed.`,
    "",
    ...(order.items || []).map((it) => `- ${it.name} x${it.quantity}: ${formatPrice(Number(it.price) * Number(it.quantity))}`),
    "",
    `Subtotal: ${formatPrice(order.subtotal)}`,
    `Delivery: ${Number(order.shipping) > 0 ? formatPrice(order.shipping) : "Free"}`,
    `Total: ${formatPrice(order.total)}`,
    `Payment: ${paymentLabel(order)}`,
    `Delivery address: ${addressText(order.shippingAddress)}`,
    "",
    `Questions? Reply to this email${store.email ? ` or write to ${store.email}` : ""}.`,
  ].join("\n");
  return {
    subject: `Your Mushk order #${order.orderNumber} is confirmed`,
    html: layout({ preheader: `Order #${order.orderNumber} · ${formatPrice(order.total)}`, body }),
    text,
  };
}

function adminEmailContent(order) {
  const c = order.customer || {};
  const base = siteBase();
  const adminLink = base ? `${base}/admin/orders/${order.id}` : "";
  const body = `
<p style="margin:0 0 6px;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;color:${C.gold};font-weight:bold">New order</p>
<h1 style="margin:0 0 4px;font-family:Georgia,serif;font-weight:normal;font-size:26px">#${esc(order.orderNumber)} · ${esc(formatPrice(order.total))}</h1>
<p style="margin:0 0 16px;font-size:14px;color:${C.muted}">${esc(paymentLabel(order))} · ${(order.items || []).reduce((n, it) => n + Number(it.quantity || 0), 0)} item(s)</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.6;margin-bottom:12px">
<tr><td style="color:${C.muted};width:110px;vertical-align:top">Customer</td><td>${esc(customerName(c) || "—")}</td></tr>
<tr><td style="color:${C.muted};vertical-align:top">Email</td><td><a href="mailto:${esc(c.email)}" style="color:${C.ink}">${esc(c.email)}</a></td></tr>
<tr><td style="color:${C.muted};vertical-align:top">Phone</td><td>${c.phone ? `<a href="tel:${esc(String(c.phone).replace(/[^+0-9]/g, ""))}" style="color:${C.ink}">${esc(c.phone)}</a>` : "—"}</td></tr>
<tr><td style="color:${C.muted};vertical-align:top">Address</td><td>${addressHtml(order.shippingAddress) || "—"}</td></tr>
${order.customerNotes ? `<tr><td style="color:${C.muted};vertical-align:top">Notes</td><td>${esc(order.customerNotes)}</td></tr>` : ""}
</table>
${itemsTable(order.items)}
${totalsTable(order)}
${
  adminLink
    ? `<p style="margin:24px 0 8px;text-align:center"><a href="${adminLink}" style="display:inline-block;background:${C.ink};color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:6px;font-size:14px;font-weight:bold">Open order in admin</a></p>`
    : ""
}`;
  const text = [
    `New order #${order.orderNumber} — ${formatPrice(order.total)} (${paymentLabel(order)})`,
    `Customer: ${customerName(c)} <${c.email}> ${c.phone || ""}`,
    `Address: ${addressText(order.shippingAddress)}`,
    order.customerNotes ? `Notes: ${order.customerNotes}` : "",
    "",
    ...(order.items || []).map((it) => `- ${it.name} x${it.quantity}: ${formatPrice(Number(it.price) * Number(it.quantity))}`),
    "",
    `Total: ${formatPrice(order.total)}`,
    adminLink,
  ]
    .filter((l) => l !== "")
    .join("\n");
  return {
    subject: `🛍️ New order #${order.orderNumber} — ${formatPrice(order.total)}`,
    html: layout({ preheader: `${customerName(c)} · ${formatPrice(order.total)}`, body }),
    text,
  };
}

// ---------------------------------------------------------------------------
// Public helpers

// `row` is an orders row (customerEmail column + customer jsonb) or a
// serialized order (customer.email). Never throws.
export async function sendOrderEmails(row) {
  try {
    const order = {
      ...row,
      customer: { ...(row.customer || {}), email: row.customer?.email || row.customerEmail || "" },
    };
    const store = await storeContact();
    const notifyTo = process.env.ORDER_NOTIFY_EMAIL || store.email || process.env.SMTP_USER;
    const jobs = [];

    if (order.customer.email) {
      const m = customerEmailContent(order, store);
      jobs.push(sendMail({ to: order.customer.email, replyTo: store.email || undefined, ...m }));
    }
    if (notifyTo) {
      const m = adminEmailContent(order);
      jobs.push(sendMail({ to: notifyTo, replyTo: order.customer.email || undefined, ...m }));
    }
    const results = await Promise.allSettled(jobs);
    results.forEach((r) => {
      if (r.status === "rejected") console.error(`[email] order #${order.orderNumber}:`, r.reason?.message || r.reason);
    });
  } catch (err) {
    console.error("[email] sendOrderEmails failed:", err.message);
  }
}

export async function sendContactEmail({ name, email, phone, subject, message, inquiryType }) {
  const store = await storeContact();
  const to = process.env.CONTACT_EMAIL || store.email || process.env.SMTP_USER;
  const body = `
<p style="margin:0 0 6px;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;color:${C.gold};font-weight:bold">Website message · ${esc(inquiryType || "general")}</p>
<h1 style="margin:0 0 14px;font-family:Georgia,serif;font-weight:normal;font-size:22px">${esc(subject || "New message")}</h1>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.6;margin-bottom:16px">
<tr><td style="color:${C.muted};width:80px">From</td><td>${esc(name)}</td></tr>
<tr><td style="color:${C.muted}">Email</td><td><a href="mailto:${esc(email)}" style="color:${C.ink}">${esc(email)}</a></td></tr>
${phone ? `<tr><td style="color:${C.muted}">Phone</td><td>${esc(phone)}</td></tr>` : ""}
</table>
<div style="padding:16px;border-radius:10px;background:${C.cream};font-size:14px;line-height:1.7;white-space:pre-wrap">${esc(message)}</div>
<p style="margin:14px 0 0;font-size:12px;color:${C.muted}">Reply to this email to answer ${esc(name)} directly.</p>`;
  return sendMail({
    to,
    replyTo: `${name} <${email}>`,
    subject: `Website message: ${subject || inquiryType || "New message"}`,
    html: layout({ preheader: `${name}: ${String(message).slice(0, 80)}`, body }),
    text: `From: ${name} <${email}>${phone ? `\nPhone: ${phone}` : ""}\nType: ${inquiryType}\n\n${message}`,
  });
}
