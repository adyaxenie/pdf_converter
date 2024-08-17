'use client';

import { SendHorizonal } from 'lucide-react';
import stripePromise from '../lib/stripe';
import { useState } from 'react';

const PricingCheckoutButton = ({ priceId, tier, buttonText, className }: { priceId: string, tier: number, buttonText:string, className: string }) => {
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
    <button className={className} disabled={loading} onClick={handleClick} >
      <p> 
      {loading ? 'Processing...' : buttonText}
      </p>
      </button>
  );
};

export default PricingCheckoutButton;
