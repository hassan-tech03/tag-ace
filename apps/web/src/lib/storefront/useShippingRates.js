"use client";

import { useEffect, useState } from "react";
import { DEFAULT_RATES, ratesFromSettings } from "@/lib/orderUtils";

// Public settings from Admin → Site Content, fetched once per page load and
// shared by every component that asks. Hooks start with defaults so the
// first render never waits on the network.
let cached = null;
let inflight = null;

const DEFAULT_STORE = { name: "Mushk Perfumes", email: "", phone: "", address: "" };

function load() {
  if (cached) return Promise.resolve(cached);
  inflight ??= fetch("/api/storefront/settings", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .then((b) => {
      cached = {
        rates: ratesFromSettings(b?.shipping),
        storeInfo: { ...DEFAULT_STORE, ...(b?.storeInfo || {}) },
      };
      return cached;
    })
    .catch(() => ({ rates: DEFAULT_RATES, storeInfo: DEFAULT_STORE }))
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

function useSetting(pick, fallback) {
  const [value, setValue] = useState(cached ? pick(cached) : fallback);
  useEffect(() => {
    let alive = true;
    load().then((s) => alive && setValue(pick(s)));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
}

export function useShippingRates() {
  return useSetting((s) => s.rates, DEFAULT_RATES);
}

// Store name / support email / phone / address.
export function useStoreInfo() {
  return useSetting((s) => s.storeInfo, DEFAULT_STORE);
}
