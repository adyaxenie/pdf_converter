import { NextResponse } from 'next/server';
import { createClient } from '../../../utils/supabase/client';

const supabase = createClient();

export async function POST(request: Request) {
  try {
    const { email, tier, expirationDate, subscriptionId } = await request.json();

    // Check if the user exists
    let { data: existingUser, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    let data, error;

    if (existingUser) {
      // Update existing user's tier
      ({ data, error } = await supabase
        .from('user_profiles')
        .update({ tier, expiration_date: expirationDate, stripe_subscription_id: subscriptionId })
        .eq('email', email)
        .select());
    } else {
      // Insert new user with email and tier
      ({ data, error } = await supabase
        .from('user_profiles')
        .insert({ email, tier, expiration_date: expirationDate, stripe_subscription_id: subscriptionId })
        .select());
    }

    if (error) {
      throw error;
    }
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}