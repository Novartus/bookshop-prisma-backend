import { Stripe as stripe } from 'stripe';

const Stripe = new stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: null,
});

export default Stripe;
