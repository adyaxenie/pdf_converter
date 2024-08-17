import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '../../../utils/supabase/client';

const supabase = createClient();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
    try {
      const { user_email } = await request.json();
  
      const { data, error } = await supabase
        .from('user_profiles')
        .select('stripe_subscription_id')
        .eq('email', user_email)
        .single(); 
  
      if (error) {
        return NextResponse.json({ error: 'Error fetching user profile' }, { status: 400 });
      }
  
      const { stripe_subscription_id } = data;

      if (!stripe_subscription_id) {
        return NextResponse.json({ message: 'No subscription found for this user.' });
      }

      const subscription = await stripe.subscriptions.retrieve(stripe_subscription_id);
      if (subscription.status === 'canceled') {
        return NextResponse.json({ message: 'Subscription already cancelled. You have access to SupBot until end of your subscription or trial date.' });
      }

      const deletedSubscription = await stripe.subscriptions.cancel(
        stripe_subscription_id
      );
  
      return NextResponse.json({ message: 'Subscription cancelled successfully.', subscription: deletedSubscription });
    } catch (error:any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }