'use client';

import { SendHorizonal, ArrowRight } from 'lucide-react';
import stripePromise from '../lib/stripe';
import { useState } from 'react';

const StripeCheckoutButton = ({ priceId, tier }: { priceId: string, tier: number }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);

    const stripe = await stripePromise;

    const response = await fetch('/api/checkout_sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId, tier }),
    });

    const session = await response.json();

    const result = await stripe?.redirectToCheckout({
      sessionId: session.id,
    });

    if (result?.error) {
      console.error(result.error.message);
    }

    setLoading(false);
  };

  return (
    <button className="btn btn-secondary btn-md font-bold items-center text-neutral-content w-40" disabled={loading} onClick={handleClick} >
      <p> 
      {loading ? 'Processing...' : 'Try for Free'}
      </p>
      {/* <ArrowRight /> */}
      </button>
  );
};

export default StripeCheckoutButton;
