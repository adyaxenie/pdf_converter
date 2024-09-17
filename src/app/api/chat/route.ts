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

    const promptParts = prompt.split('--- Page Break ---');
    const firstPrompt = promptParts[0];

    const tableInstructions = `
    Please structure the output in a JSON format that can be easily converted to a table.:
    Create an array of objects, where each object represents a row in the table.
    Create a key-value pair for each column in the table, where the key is the column name and the value is the content of the cell.
    `;  

    const modifiedPrompt = `${firstPrompt}\n\n${tableInstructions}`;

    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      messages: [{ role: 'user', content: modifiedPrompt }],
      model: 'gpt-4o-mini',
      temperature: 0,
    };

    const chatCompletion = await openai.chat.completions.create(params, { stream: false }) as OpenAI.Chat.ChatCompletion;
    let aiResponse: string;

    if (chatCompletion.choices && chatCompletion.choices.length > 0) {
      aiResponse = chatCompletion.choices[0].message?.content ?? 'No response from AI';
    } else {
      aiResponse = 'No response from AI';
    } 

    let extractedJson;
    try {
      // Updated regex to account for newlines and possible JSON structures
      const jsonMatch = aiResponse.match(/\[.*?\]|\{.*?\}/s);
      if (jsonMatch) {
        extractedJson = JSON.parse(jsonMatch[0]);
      } else {
        extractedJson = { error: 'No JSON found in the AI response' };
      }
    } catch (jsonError) {
      console.error('Error parsing JSON from AI response:', jsonError);
      extractedJson = { error: 'Failed to parse JSON from AI response' };
    }    

    return NextResponse.json({ text: aiResponse, json: extractedJson });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'An error occurred while generating text' }, { status: 500 });
  }
}