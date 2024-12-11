'use client'

const API_TOKEN = '92c7437e5e4ad44da4ba2f9a8927d6eaa514f8b1';
const API_URL = 'https://api.todoist.com/rest/v2';

async function apiRequest(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

const TodoistAPI = {
  getTasks: () => apiRequest('/tasks'),
  createTask: (content) => apiRequest('/tasks', 'POST', { content }),
  updateTask: (id, data) => apiRequest(`/tasks/${id}`, 'POST', data),
  deleteTask: (id) => apiRequest(`/tasks/${id}`, 'DELETE'),
  closeTask: (id) => apiRequest(`/tasks/${id}/close`, 'POST')
};

