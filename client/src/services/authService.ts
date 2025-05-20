import { env } from "@/env";

const API_BASE_URL = env.VITE_SERVER_URL

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

/**
 * Logs in the user.
 * NOTE: Ensure your server's /auth/login endpoint is a POST request.
 */
export async function login(email: string, password: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Login failed" }));
    throw new Error(errorData.message || "Login failed due to server error");
  }

  const data: AuthResponse = await response.json();
  if (data.token) {
    localStorage.setItem("authToken", data.token);
  }
  return data.user;
}

/**
 * Logs out the user.
 */
export async function logout(): Promise<void> {
  // await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });

  localStorage.removeItem("authToken");
}

/**
 * Retrieves the current session user if a token exists.
 */
export async function getSession(): Promise<User | null> {
  const token = localStorage.getItem("authToken");
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/session`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      localStorage.removeItem("authToken");
      return null;
    }

    if (!response.ok) {
      console.error("Failed to fetch session:", response.status);
      return null;
    }

    const data: { user: User } = await response.json();
    return data.user;
  } catch (error) {
    console.error("Error fetching session:", error);
    localStorage.removeItem("authToken"); // Clear token on error too
    return null;
  }
}

/**
 * Registers a new user.
 * NOTE: Ensure your server's /auth/signup endpoint is a POST request.
 */
export async function signup(email: string, password: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Signup failed" }));
    throw new Error(errorData.message || "Signup failed due to server error");
  }

  return response.json();
}

/**
 * Gets the authentication token from localStorage
 */
export function getAuthToken(): string | null {
  return localStorage.getItem("authToken");
}
