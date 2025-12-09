import Groq from 'groq-sdk';

const apiKey = import.meta.env.VITE_GROQ_API_KEY;
console.log('Groq API Key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING');

const groq = new Groq({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true
});

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function sendToGroq(messages: GroqMessage[]): Promise<string> {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 1024,
      stream: false,
    });

    return chatCompletion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Groq API Error:', error);
    throw error;
  }
}

export async function sendToGroqJSON(messages: GroqMessage[]): Promise<string> {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.1-8b-instant',
      temperature: 0.5,
      max_tokens: 4096,
      stream: false,
      response_format: { type: 'json_object' }
    });

    return chatCompletion.choices[0]?.message?.content || '{}';
  } catch (error) {
    console.error('Groq API Error:', error);
    throw error;
  }
}

export async function sendToGroqStream(
  messages: GroqMessage[],
  onChunk: (text: string) => void
): Promise<void> {
  try {
    const stream = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 1024,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        onChunk(content);
      }
    }
  } catch (error) {
    console.error('Groq API Stream Error:', error);
    throw error;
  }
}
