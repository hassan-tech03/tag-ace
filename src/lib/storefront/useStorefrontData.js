"use client";

import { useEffect, useState } from "react";

// Generic fetch hook that:
//  - returns null while loading
//  - returns the fetched data if the API responds with items
//  - returns null on error so the caller can use its hardcoded fallback
//
// The contract is intentionally loose: the caller decides whether to swap to
// fallback based on `data == null` or `data.items.length === 0`.
export function useStorefrontFetch(url, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(url, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (cancelled) return;
        setData(body || null);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading };
}

export function useStorefrontProducts(query = "", deps = []) {
  return useStorefrontFetch(`/api/storefront/products${query ? `?${query}` : ""}`, deps);
}

export function useStorefrontTestimonials(limit = 12) {
  return useStorefrontFetch(`/api/storefront/testimonials?limit=${limit}`, [limit]);
}

export function useStorefrontOffers(type = "") {
  const url = `/api/storefront/offers${type ? `?type=${encodeURIComponent(type)}` : ""}`;
  return useStorefrontFetch(url, [type]);
}

export function useStorefrontSettings() {
  return useStorefrontFetch(`/api/storefront/settings`, []);
}
