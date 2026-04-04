import { loadStripe } from '@stripe/stripe-js';

// Preload Stripe.js immediately at module level
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
export const stripePromise = loadStripe(publishableKey);
