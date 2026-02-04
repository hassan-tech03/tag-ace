# 🔧 How to Enable Stripe After Installing Dependencies

## Step 1: Install Dependencies
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js stripe
```

## Step 2: Uncomment Code in These Files

### 1. `src/lib/stripe.js`
- Uncomment the import: `import { loadStripe } from '@stripe/stripe-js';`
- Uncomment the getStripe function code
- Comment out the temporary return null

### 2. `src/app/api/create-payment-intent/route.js`
- Uncomment: `import Stripe from 'stripe';`
- Uncomment the stripe initialization
- Replace the temporary response with the actual Stripe code

### 3. `src/app/checkout/page.js`
- Uncomment the Stripe imports at the top
- Uncomment the useEffect for initializing Stripe
- Replace the info box with the actual Stripe Elements code

### 4. `src/components/ui/StripePaymentForm.js`
- Uncomment the Stripe imports
- Uncomment the stripe and elements hooks
- Replace the placeholder with the actual PaymentElement

## Step 3: Test
- Go to checkout
- Select "Credit Card"
- Use test card: `4242 4242 4242 4242`
- Expiry: `12/25`, CVC: `123`

## Quick Find & Replace
After installing dependencies, you can quickly find and replace:

**Find:** `// Uncomment this code after installing Stripe dependencies:`
**Replace:** (delete this line and uncomment the code below it)

**Find:** `/* ... */` (the commented Stripe code blocks)
**Replace:** (uncomment by removing /* and */)

The checkout page will work perfectly with Cash on Delivery until you enable Stripe!