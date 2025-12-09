import type { GroqMessage } from './groqAI';

// Use environment variable for production or fallback to localhost
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';

export interface ConversationDocument {
  _id?: string;
  sessionId: string;
  messages: GroqMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export async function saveConversation(sessionId: string, messages: GroqMessage[]): Promise<void> {
  try {
    if (!sessionId || !messages || messages.length === 0) {
      console.warn('Invalid conversation data, skipping save');
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(`${API_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, messages }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Conversation saved successfully');
    } else {
      console.error('❌ Failed to save conversation:', data.error);
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('⏱️ Save conversation timeout - server may be slow');
    } else if (error.message?.includes('Failed to fetch')) {
      console.error('🌐 Network error - cannot reach backend server');
    } else {
      console.error('❌ Error saving conversation:', error.message);
    }
    // Don't throw - save failures shouldn't break the app
  }
}

export async function loadConversation(sessionId: string): Promise<GroqMessage[] | null> {
  try {
    if (!sessionId) {
      console.warn('No session ID provided for loading');
      return null;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const response = await fetch(`${API_URL}/conversations/${sessionId}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        console.log('No saved conversation found');
        return null;
      }
      throw new Error(`Server error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.messages) {
      console.log('✅ Conversation loaded successfully');
      return data.messages;
    }
    
    return null;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('⏱️ Load conversation timeout');
    } else if (error.message?.includes('Failed to fetch')) {
      console.error('🌐 Network error - cannot reach backend');
    } else {
      console.error('❌ Error loading conversation:', error.message);
    }
    return null; // Return null on error to allow app to continue
  }
}

export async function deleteConversation(sessionId: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/conversations/${sessionId}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Conversation deleted from MongoDB');
    } else {
      console.error('Failed to delete conversation:', data.error);
    }
  } catch (error) {
    console.error('Error deleting conversation:', error);
  }
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function getStoredSessionId(): string | null {
  return localStorage.getItem('fusion_session_id');
}

export function setStoredSessionId(sessionId: string): void {
  localStorage.setItem('fusion_session_id', sessionId);
}

export function clearStoredSessionId(): void {
  localStorage.removeItem('fusion_session_id');
}
