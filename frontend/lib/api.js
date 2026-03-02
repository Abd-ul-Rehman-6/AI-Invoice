// Use Next.js rewrite proxy to avoid CORS issues:
// /api/*  ->  http://127.0.0.1:5000/*
const API_BASE = ""; // Empty for proxy, or 'http://localhost:5000' for direct

async function handleResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  let data = null;
  
  try {
    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    // Handle 401 Unauthorized specifically
    if (res.status === 401) {
      // Clear invalid token
      if (typeof window !== 'undefined') {
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
        // Redirect to login if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      throw new Error("Your session has expired. Please log in again.");
    }

    const message =
      (data && (data.error || data.message)) ||
      (typeof data === "string" ? data : "Request failed");
    throw new Error(message);
  }
  return data;
}

export async function apiFetch(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  // Remove /api from path if it already starts with /api
  const cleanPath = path.startsWith('/api') ? path : `/api${path}`;
  
  const url = `${API_BASE}${cleanPath}`;
  console.log(`🌐 API Fetch: ${method} ${url}`);

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  
  return handleResponse(res);
}

export async function apiUpload(path, { files, token }) {
  const form = new FormData();
  files.forEach((file) => form.append("files", file));

  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  // Remove /api from path if it already starts with /api
  const cleanPath = path.startsWith('/api') ? path : `/api${path}`;
  
  const url = `${API_BASE}${cleanPath}`;
  console.log(`🌐 API Upload: POST ${url}`);

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: form,
  });
  
  return handleResponse(res);
}

// Contact form submission - uses same base URL pattern
export async function submitContactForm(formData) {
  try {
    const cleanPath = '/api/contact';
    const url = `${API_BASE}${cleanPath}`;
    
    console.log(`📧 Contact form submission: POST ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Failed to submit form');
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Contact form error:', error);
    return { 
      success: false, 
      error: error.message || 'Network error. Please check if backend is running.' 
    };
  }
}