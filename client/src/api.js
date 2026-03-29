const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiRequest(path, { method = "GET", token, body } = {}) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${normalizedPath}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new ApiError(
      "Unable to reach the API. If you are running locally, start Spring Boot on http://localhost:4040. If this is the deployed site, make sure VITE_API_BASE points to a live backend.",
      0,
    );
  }

  let payload = null;
  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }

  if (!response.ok) {
    let message = payload?.message || payload?.error || `Request failed (${response.status})`;
    if (!payload && response.status === 500) {
      message =
        "Request failed (500). If the API is not running, start Spring Boot on http://localhost:4040 and try again.";
    }
    throw new ApiError(message, response.status);
  }

  return payload;
}
