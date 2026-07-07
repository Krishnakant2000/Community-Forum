const API_BASE_URL = 'http://localhost:3001/api';

// We hardcode our logged-in student user for this take-home slice
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'x-user-id': 'student-1',
  'x-user-role': 'student',
};

export interface Post {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
  savesCount: number;
  hasSaved: boolean;
  savedAt?: string;
}

export async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...DEFAULT_HEADERS,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error: ${res.statusText}`);
  }

  return res.json();
}