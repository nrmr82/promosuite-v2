import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with the publishable key
export const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Function to create a checkout session
export const createCheckoutSession = async (priceId) => {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
      }),
    });

    const session = await response.json();
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Function to handle subscription payment
export const handleSubscription = async (priceId) => {
  try {
    const stripe = await stripePromise;
    const session = await createCheckoutSession(priceId);
    
    // Redirect to Stripe Checkout
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error('Error handling subscription:', error);
    throw error;
  }
};