'use client';

import StripeCheckoutButton from '../components/stripeCheckoutButton';

const PaymentPage = () => {
  const priceId = 'price_1PFMZBE9ZZnNVjbUcxUAbvl5';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-100">
      <h1 className="text-4xl font-bold mb-8">Payment Page</h1>
      <div className="w-full max-w-md p-8 space-y-6 rounded-lg shadow-md">
        <StripeCheckoutButton priceId={priceId} tier={1} />
      </div>
    </div>
  );
};

export default PaymentPage;
