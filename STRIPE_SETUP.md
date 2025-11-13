# Stripe Setup Guide

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# Stripe Payment Integration
# Get your keys from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_51...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Site URL (for Stripe redirects)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Setup Steps

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Sign up for a free account
3. Complete verification

### 2. Get API Keys
1. Go to [Dashboard > API Keys](https://dashboard.stripe.com/apikeys)
2. Toggle **Test mode** ON (top right)
3. Copy **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. Copy **Secret key** → `STRIPE_SECRET_KEY`

### 3. Add to .env.local
Create/edit `.env.local` in project root:

```bash
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Test Payment
1. Start dev server: `npm run dev`
2. Go to `http://localhost:3000`
3. Click "Upgrade to Pro" or "Claim Lifetime Deal"
4. Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any ZIP code

### 5. Production Setup
When deploying:

1. Go to [Dashboard](https://dashboard.stripe.com)
2. Toggle **Test mode** OFF
3. Get live API keys
4. Update environment variables in Vercel/production:
   ```bash
   STRIPE_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   NEXT_PUBLIC_BASE_URL=https://flowtusk.com
   ```

## Webhook Setup (Optional but Recommended)

For production, set up webhooks to handle subscription events:

1. Go to [Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://flowtusk.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
4. Copy webhook signing secret
5. Add to environment: `STRIPE_WEBHOOK_SECRET=whsec_...`

## Testing

### Test Card Numbers

**Success:**
- `4242 4242 4242 4242` - Succeeds
- `5555 5555 5555 4444` - Succeeds (Mastercard)

**Failure:**
- `4000 0000 0000 0002` - Card declined

**3D Secure:**
- `4000 0027 6000 3184` - Requires authentication

## Pricing

- Pro: $29/month (recurring)
- Lifetime: $290 one-time payment

Update in `app/api/create-checkout-session/route.ts` if needed.

## Support

- [Stripe Docs](https://stripe.com/docs)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Test Card Numbers](https://stripe.com/docs/testing)

