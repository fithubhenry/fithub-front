import Cookies from 'js-cookie';

function getAuthHeaders() {
  let token = '';
  if (typeof window !== 'undefined') {
    token = Cookies.get('token') || localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  }
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

const apiClases = {
  get: async (path: string) => {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const headers = getAuthHeaders();
    const res = await fetch(BASE_URL + path, { headers });
    if (!res.ok) throw new Error('Error en GET ' + path);
    return res.json();
  },
  post: async (path: string, body: any) => {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const headers = { 'Content-Type': 'application/json', ...getAuthHeaders() };
    const res = await fetch(BASE_URL + path, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const responseText = await res.text();
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok) {
      let errorMsg = 'Error en POST ' + path;
      if (responseText && contentType.includes('application/json')) {
        try {
          const json = JSON.parse(responseText);
          errorMsg += ': ' + (json.message || JSON.stringify(json));
        } catch {
          errorMsg += ': ' + responseText;
        }
      } else if (responseText) {
        errorMsg += ': ' + responseText;
      }
      // Si no hay responseText, solo muestra el status
      console.error('POST error details:', errorMsg);
      throw new Error(errorMsg);
    }
    if (responseText && contentType.includes('application/json')) {
      try {
        return JSON.parse(responseText);
      } catch {
        return responseText;
      }
    }
    return responseText;
  },
  delete: async (path: string) => {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const headers = getAuthHeaders();
    const res = await fetch(BASE_URL + path, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) throw new Error('Error en DELETE ' + path);
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  },
};

export default apiClases;
