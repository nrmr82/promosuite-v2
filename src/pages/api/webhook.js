import Stripe from 'stripe';

const stripe = new Stripe(process.env.REACT_APP_STRIPE_SECRET_KEY);
const endpointSecret = process.env.REACT_APP_STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      endpointSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle specific event types
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        // Handle successful payment
        await handleSuccessfulPayment(session);
        break;

      case 'customer.subscription.updated':
        const subscription = event.data.object;
        // Handle subscription updates
        await handleSubscriptionUpdate(subscription);
        break;

      case 'customer.subscription.deleted':
        const canceledSubscription = event.data.object;
        // Handle subscription cancellation
        await handleSubscriptionCancellation(canceledSubscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function handleSuccessfulPayment(session) {
  // Update user's subscription status in your database
  // Add credits if it's a credit purchase
  // You'll need to implement these based on your database structure
  console.log('Processing successful payment:', session);
}

async function handleSubscriptionUpdate(subscription) {
  // Update subscription details in your database
  console.log('Processing subscription update:', subscription);
}

async function handleSubscriptionCancellation(subscription) {
  // Handle subscription cancellation in your database
  console.log('Processing subscription cancellation:', subscription);
}