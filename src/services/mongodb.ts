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
    const response = await fetch(`${API_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, messages }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Conversation saved to MongoDB');
    } else {
      console.error('Failed to save conversation:', data.error);
    }
  } catch (error) {
    console.error('Error saving conversation:', error);
  }
}

export async function loadConversation(sessionId: string): Promise<GroqMessage[] | null> {
  try {
    const response = await fetch(`${API_URL}/conversations/${sessionId}`);
    const data = await response.json();
    
    if (data.success && data.messages) {
      console.log('Conversation loaded from MongoDB');
      return data.messages;
    }
    
    return null;
  } catch (error) {
    console.error('Error loading conversation:', error);
    return null;
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
