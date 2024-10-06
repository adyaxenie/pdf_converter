import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '../../../utils/supabase/client';

const supabase = createClient();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { user_email } = await request.json();

    const { data, error } = await supabase
      .from('user_profiles')
      .select()
      .eq('email', user_email)
      .single(); 

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // const { expiration_date, stripe_subscription_id, tier } = data;

    // const today = new Date();
    // const expirationDate = expiration_date ? new Date(expiration_date) : null;

    // if (expirationDate !== null && today > expirationDate && tier !== 0) {
    //   if (stripe_subscription_id) {
    //     try {
    //       const subscription = await stripe.subscriptions.retrieve(stripe_subscription_id);
    //       if (subscription.status !== 'active') {
    //         const { error: updateError } = await supabase
    //           .from('user_profiles')
    //           .update({ tier: 0 })
    //           .eq('email', user_email);

    //         if (updateError) {
    //           return NextResponse.json({ error: updateError.message }, { status: 503 });
    //         }

    //       } else {
    //         const newExpirationDate = new Date(subscription.current_period_end * 1000);

    //         const { error: updateError } = await supabase
    //           .from('user_profiles')
    //           .update({ expiration_date: newExpirationDate })
    //           .eq('email', user_email);

    //         if (updateError) {
    //           return NextResponse.json({ error: updateError.message }, { status: 500 });
    //         }

    //         const { error: update1Error } = await supabase
    //           .from('bots')
    //           .update({ token_usage: 0 })
    //           .eq('email', user_email);

    //         if (update1Error) {
    //           return NextResponse.json({ error: update1Error.message }, { status: 501 });
    //         }
    //       }
    //     } catch (err: any) {
    //       console.log('Error:', err.message);
    //       return NextResponse.json({ error: err.message }, { status: 504 });
    //     }
    //   } else {
    //     console.log('Stripe subscription ID is null');
    //   }
    // }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}