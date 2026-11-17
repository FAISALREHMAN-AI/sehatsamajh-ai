/**
 * API client for SehatSamajh backend.
 * Reads API base URL from VITE_API_URL (default http://localhost:8000).
 */

const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const cleanUrl = envUrl.replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

const API_BASE = getApiBase();

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) {
    throw new Error('Backend service is unreachable.');
  }
  return await res.json();
}

/**
 * Analyzes a medical document (file and/or text).
 * @param {Object} params
 * @param {File|null} params.file
 * @param {string} params.text
 * @param {string} params.language - 'en' | 'ur' | 'roman_ur'
 */
export async function analyzeDocument({ file, text, language = 'en' }) {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }
  if (text && text.trim()) {
    formData.append('text', text.trim());
  }
  formData.append('language', language);

  try {
    const res = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.error || data.detail || `Server returned error (${res.status})`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
      throw new Error('Could not connect to backend server. Make sure the backend is running on port 8000.');
    }
    throw err;
  }
}

/**
 * Asks a follow-up question on an analyzed report.
 * @param {Object} params
 * @param {Object} params.context - analysis result object
 * @param {string} params.question - user's question
 * @param {string} params.language - 'en' | 'ur' | 'roman_ur'
 */
export async function askQuestion({ context, question, language = 'en' }) {
  try {
    const res = await fetch(`${API_BASE}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        context,
        question: question.trim(),
        language,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.error || data.detail || `Server returned error (${res.status})`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
      throw new Error('Could not connect to backend server. Make sure the backend is running.');
    }
    throw err;
  }
}
