// Base URL for the backend. In dev, /api is proxied by Vite (see vite.config.js).
// In production, set VITE_API_BASE_URL to your deployed backend's origin.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data.error || data.detail || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export async function checkHealth() {
  const res = await fetch(`${BASE_URL}/api/health`);
  return handleResponse(res);
}

export async function predictChurn(customer) {
  const res = await fetch(`${BASE_URL}/api/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customer),
  });
  return handleResponse(res);
}
