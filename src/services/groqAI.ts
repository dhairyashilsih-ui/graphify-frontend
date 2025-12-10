const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqOptions {
  sessionId?: string;
}

export async function sendToGroq(messages: GroqMessage[], options: GroqOptions = {}): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/groq/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(options.sessionId ? { 'x-session-id': options.sessionId } : {})
      },
      body: JSON.stringify({ messages, sessionId: options.sessionId })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Groq proxy error (${response.status})`);
    }

    const data = await response.json();
    if (!data?.success || !data?.content) {
      throw new Error(data?.error || 'No response content received from Groq API');
    }

    return data.content;
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

export async function sendToGroqJSON(messages: GroqMessage[], options: GroqOptions = {}): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/groq/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(options.sessionId ? { 'x-session-id': options.sessionId } : {})
      },
      body: JSON.stringify({ messages, sessionId: options.sessionId, responseFormat: 'json_object', maxTokens: 4096, temperature: 0.5 })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Groq proxy error (${response.status})`);
    }

    const data = await response.json();
    const content = data?.content;
    if (!data?.success || !content) {
      throw new Error(data?.error || 'No JSON response received from API');
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
    // Backend does not stream yet; fall back to single response
    const full = await sendToGroq(messages);
    onChunk(full);
  } catch (error) {
    console.error('Groq API Stream Error:', error);
    throw error;
  }
}
