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
      const errorBody = await response.text();
      console.error(`API Error (${response.status}):`, errorBody);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

const TodoistAPI = {
  getTasks: () => apiRequest('/tasks'),
  createTask: (content) => apiRequest('/tasks', 'POST', { content }),
  updateTask: (id, data) => {
    // Ensure we're always sending a non-empty object with valid fields
    const validFields = ['content', 'description', 'label_ids', 'priority', 'due_string', 'due_date', 'due_datetime', 'due_lang', 'assignee_id'];
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([key, value]) => validFields.includes(key) && value !== undefined && value !== null)
    );
    return apiRequest(`/tasks/${id}`, 'POST', filteredData);
  },
  deleteTask: (id) => apiRequest(`/tasks/${id}`, 'DELETE'),
  closeTask: (id) => apiRequest(`/tasks/${id}/close`, 'POST')
};
