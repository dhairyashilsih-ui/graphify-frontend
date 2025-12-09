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
    if (!apiKey) {
      throw new Error('GROQ API key is missing. Please add VITE_GROQ_API_KEY to your environment variables.');
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 1024,
      stream: false,
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content received from Groq API');
    }

    return content;
  } catch (error: any) {
    console.error('Groq API Error:', error);
    
    // Handle specific error types
    if (error.message?.includes('API key')) {
      throw new Error('Invalid API key. Please check your Groq API key.');
    }
    if (error.message?.includes('rate limit')) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    }
    if (error.message?.includes('network') || error.name === 'TypeError') {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    throw new Error(`AI service error: ${error.message || 'Unknown error occurred'}`);
  }
}

export async function sendToGroqJSON(messages: GroqMessage[]): Promise<string> {
  try {
    if (!apiKey) {
      throw new Error('GROQ API key is missing. Please add VITE_GROQ_API_KEY to your environment variables.');
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.1-8b-instant',
      temperature: 0.5,
      max_tokens: 4096,
      stream: false,
      response_format: { type: 'json_object' }
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No JSON response received from Groq API');
    }

    // Validate JSON
    try {
      JSON.parse(content);
    } catch {
      throw new Error('Invalid JSON response from API');
    }

    return content;
  } catch (error: any) {
    console.error('Groq API JSON Error:', error);
    
    if (error.message?.includes('API key')) {
      throw new Error('Invalid API key. Please check your Groq API key.');
    }
    if (error.message?.includes('rate limit')) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    }
    if (error.message?.includes('network') || error.name === 'TypeError') {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    throw new Error(`AI service error: ${error.message || 'Unknown error occurred'}`);
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
