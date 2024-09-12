import OpenAI from 'openai';
import { NextResponse, NextRequest } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!, 
});

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const promptParts = prompt.split(' --- Page Break --- ');
    const firstPrompt = promptParts[0];

    // Define instructions for generating table-compatible text
    const tableInstructions = `
    Please structure the output in a JSON format that can be easily converted to a table.:
    Create an array of objects, where each object represents a row in the table.
    Create a key-value pair for each column in the table, where the key is the column name and the value is the content of the cell.
    `;

    // Add the instructions to the prompt
    const modifiedPrompt = `${firstPrompt}\n\n${tableInstructions}`;

    // Call OpenAI API to generate text
    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      messages: [{ role: 'user', content: modifiedPrompt }],
      model: 'gpt-4o-mini',
    };

    const chatCompletion = await openai.chat.completions.create(params, { stream: false }) as OpenAI.Chat.ChatCompletion;
    let aiResponse: string;

    if (chatCompletion.choices && chatCompletion.choices.length > 0) {
      aiResponse = chatCompletion.choices[0].message?.content ?? 'No response from AI';
    } else {
      aiResponse = 'No response from AI';
    }

    return NextResponse.json({ text: aiResponse });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'An error occurred while generating text' }, { status: 500 });
  }
}
