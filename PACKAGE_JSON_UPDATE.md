# 📦 Package.json Dependencies to Add

When your terminal is working, run this single command:

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js stripe
```

## Or manually add to package.json:

Add these to your `dependencies` section in `package.json`:

```json
{
  "dependencies": {
    "@stripe/stripe-js": "^2.1.0",
    "@stripe/react-stripe-js": "^2.3.0",
    "stripe": "^14.0.0"
  }
}
```

Then run:
```bash
npm install
```

## What each package does:

- **@stripe/stripe-js**: Client-side Stripe library
- **@stripe/react-stripe-js**: React components for Stripe
- **stripe**: Server-side Stripe library for API calls