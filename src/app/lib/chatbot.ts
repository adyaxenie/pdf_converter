import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!, 
});

export async function getTrainedChatbotResponse(query: string, botInfo: any): Promise<string> {
  try {
    const prompt = `
      You are a chatbot trained for the company "${botInfo.name}". 
      ${botInfo.description}

      Here is some specific information to help you:
      ${botInfo.training_data}

      User Query: ${query}

      if (user asks for support of a real person) {
        Please note that I am an AI chatbot and not able to provide real-time assistance. 
        Your query will be forwarded to a real person for further assistance. 
        The chat will be ended, and your information will be sent to the company's email for follow-up.
      }
    `;

    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
    };

    const chatCompletion: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create(params);
    if (chatCompletion.choices && chatCompletion.choices.length > 0) {
      return chatCompletion.choices[0].message?.content ?? 'No response from AI';
    }

    throw new Error('No choices returned from OpenAI');
  } catch (error) {
    console.error('Error fetching chatbot response:', error);
    throw new Error('Failed to fetch response from OpenAI');
  }
}
