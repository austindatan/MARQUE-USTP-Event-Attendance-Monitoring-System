import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../config";

export async function apiFetch(path, options = {}) {
  const token = await AsyncStorage.getItem("token");

  const headers = {
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

  if (response.status === 401) {
    throw new Error("Unauthorized. Please log in again.");
  }

  const text = await response.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    if (!response.ok) throw new Error(text || "Server error");
    return text;
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}
96
export async function apiFetchForm(method, path, formData) {
  return apiFetch(path, { method, body: formData });
}
