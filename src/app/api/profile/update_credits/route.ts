import { NextResponse } from 'next/server';
import { createClient } from '../../../utils/supabase/client';

const supabase = createClient();

export async function POST(request: Request) {
  const { user_email, credits } = await request.json();

  const updatedCredits = credits - 1;

  const { data, error } = await supabase
    .from('user_profiles')
    .update([{ 'credits': updatedCredits}])
    .eq('email', user_email)
    .select()


  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}
