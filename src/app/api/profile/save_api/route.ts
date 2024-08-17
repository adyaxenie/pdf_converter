import { NextResponse } from 'next/server';
import { createClient } from '../../../utils/supabase/client';

const supabase = createClient();

export async function POST(request: Request) {
  const { user_email, api_key } = await request.json();

  const { data, error } = await supabase
    .from('user_profiles')
    .update([{ 'openai_api_key': api_key}])
    .eq('email', user_email)
    .select()


  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}
