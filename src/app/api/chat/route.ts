// app/api/generate-text/route.js

import { generateText } from 'ai';
import { createOpenAI as createGroq } from '@ai-sdk/openai';
import { NextResponse, NextRequest } from 'next/server';

const groq = createGroq({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const { text } = await generateText({
      model: groq('llama-3.1-70b-versatile'),
      prompt,
    });

    return NextResponse.json({ text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'An error occurred while generating text' }, { status: 500 });
  }
}
