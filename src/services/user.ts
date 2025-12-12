import type { AuthUser } from '../pages/Login';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';

export async function saveUserProfile(user: AuthUser): Promise<void> {
  if (!user || !user.email) return;

  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user }),
    });

    if (!response.ok) {
      console.warn('Failed to persist user profile', response.status, response.statusText);
    }
  } catch (err) {
    console.warn('Unable to reach backend to persist user profile', err);
  }
}
