"use client"
import Stripe from 'stripe';
import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';
import stripePromise from '../lib/stripe';
import { signIn, signOut, useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios';

const SuccessPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
 
  const sessionId = searchParams.get('session_id');
  
  const [loading, setLoading] = useState(true);
  const { data: currentSession } = useSession();


  const saveTier = async (email, tier, expirationDate, subscriptionId) => {
    try {
      const response = await axios.post('/api/profile/save_tier', { email, tier, expirationDate, subscriptionId });
    } catch (error) {
      console.error(error);
    }
  };

  const stripeInfo = async (sessionId) => {
    try {
      const response = await axios.post('/api/stripe/success', { sessionId });
      return response.data.data;
    } catch (error){
      console.error(error);
    }
  };

  useEffect(() => {
    const updateProfile = async () => {
      const {email, tier, expirationDate, subscriptionId} = await stripeInfo(sessionId);
      const sessionEmail = currentSession?.user?.email;

      const emailToUse = email || sessionEmail;
      if (emailToUse) {
        await saveTier(emailToUse, tier, expirationDate, subscriptionId);
      } else {
        console.error('No email found to update the profile');
      }

      setLoading(false);
    };

    updateProfile();

    router.push('/chat/create');
  }, [sessionId, currentSession]);

  return (
    <div className='bg-base-100 h-1/2 flex justify-center items-center'>
      {loading && (
        <div className='items-center'>
          <span className="loading loading-ball loading-lg text-primary-content ml-12 mt-20"></span>
          <p className='text-primary-content'>
            Processing Payment...
          </p>
        </div>
      )}
    </div>
  );
};

const SuccessPage = () => (
  <Suspense fallback={<div className='bg-base-100'>Loading...</div>}>
    <SuccessPageContent />
  </Suspense>
);

export default SuccessPage;
