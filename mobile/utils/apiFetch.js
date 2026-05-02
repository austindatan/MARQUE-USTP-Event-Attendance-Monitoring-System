import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../config";

/**
 * Authenticated fetch wrapper.
 * Automatically attaches the JWT token from AsyncStorage as an Authorization header.
 *
 * Usage:
 *   const data = await apiFetch("/api/organizations", { method: "GET" });
 *   const data = await apiFetch("/api/organizations", { method: "POST", body: formData });
 *
 * @param {string} path - API path (e.g. "/api/organizations")
 * @param {RequestInit} options - Standard fetch options (method, body, headers, etc.)
 * @returns {Promise<any>} - Parsed JSON response
 * @throws {Error} - Throws on non-OK responses with the server's message
 */
export async function apiFetch(path, options = {}) {
  const token = await AsyncStorage.getItem("token");

  const headers = {
    // Don't set Content-Type for FormData — fetch sets it automatically with boundary
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized gracefully
  if (response.status === 401) {
    throw new Error("Unauthorized. Please log in again.");
  }

  const text = await response.text();

  // Try to parse as JSON
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    // Non-JSON response (shouldn't happen normally)
    if (!response.ok) throw new Error(text || "Server error");
    return text;
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

/**
 * Authenticated axios-style multipart FormData helper.
 * Use this for file uploads (organizations, events with images).
 *
 * @param {string} method - "POST" | "PUT" | "DELETE"
 * @param {string} path - API path (e.g. "/api/organizations")
 * @param {FormData} formData - FormData object with files attached
 * @returns {Promise<any>} - Parsed JSON response
 */
export async function apiFetchForm(method, path, formData) {
  return apiFetch(path, { method, body: formData });
}
