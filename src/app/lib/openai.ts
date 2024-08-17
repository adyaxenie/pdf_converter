import axios from 'axios'

const openaiApiKey = process.env.OPENAI_API_KEY

export const getChatbotResponse = async (query: string): Promise<string> => {
  const response = await axios.post(
    'https://api.openai.com/v1/engines/davinci-codex/completions',
    {
      prompt: `User query: ${query}\nChatbot response:`,
      max_tokens: 100,
    },
    {
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
      },
    }
  )
  return response.data.choices[0].text.trim()
}
