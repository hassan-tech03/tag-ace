"use client";

import { useEffect, useState } from "react";
import { DEFAULT_RATES, ratesFromSettings } from "@/lib/orderUtils";

// Shipping/tax rates from Admin → Site Content, fetched once per page load
// and shared by every component that asks. Starts with the defaults so the
// first render never waits on the network.
let cached = null;
let inflight = null;

function load() {
  if (cached) return Promise.resolve(cached);
  inflight ??= fetch("/api/storefront/settings", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .then((b) => {
      cached = ratesFromSettings(b?.shipping);
      return cached;
    })
    .catch(() => DEFAULT_RATES)
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function useShippingRates() {
  const [rates, setRates] = useState(cached || DEFAULT_RATES);
  useEffect(() => {
    let alive = true;
    load().then((r) => alive && setRates(r));
    return () => {
      alive = false;
    };
  }, []);
  return rates;
}
