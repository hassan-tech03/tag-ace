// "Save this information for next time" at checkout: contact and delivery
// details are kept in this browser's localStorage only (never sent anywhere
// else) and pre-fill the form on the next visit. Unticking the box and
// placing an order deletes them. Payment details are never saved.
const KEY = "mushk_checkout_details";
const FIELDS = ["email", "firstName", "lastName", "company", "phone", "address", "apartment", "city", "state", "zipCode"];

export function loadSavedDetails() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) || "null");
    if (!raw || typeof raw !== "object") return null;
    const out = {};
    for (const f of FIELDS) if (typeof raw[f] === "string") out[f] = raw[f].slice(0, 300);
    return Object.keys(out).length ? out : null;
  } catch {
    return null;
  }
}

export function rememberDetails(formData, keep) {
  try {
    if (keep) {
      const out = {};
      for (const f of FIELDS) out[f] = String(formData[f] || "");
      window.localStorage.setItem(KEY, JSON.stringify(out));
    } else {
      window.localStorage.removeItem(KEY);
    }
  } catch {
    // storage blocked (private mode etc.) - nothing to do
  }
}
