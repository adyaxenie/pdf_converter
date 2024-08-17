'use client';

import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

const PaymentForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement!,
    });

    if (error) {
      setError(error.message ?? 'An unknown error occurred');
      setLoading(false);
      return;
    }

    // Simulate a successful payment for this example
    // In a real application, you would send the paymentMethod.id to your server to handle the payment
    setLoading(false);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <CardElement className="input input-bordered" />
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <div className="form-control">
        <button type="submit" className="btn btn-primary" disabled={!stripe || loading}>
          {loading ? 'Processing...' : 'Pay'}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
