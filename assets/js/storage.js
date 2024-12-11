'use client'

const StorageManager = {
  saveTasks: (tasks) => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  },

  getTasks: () => {
    const tasks = localStorage.getItem('tasks');
    return tasks ? JSON.parse(tasks) : [];
  },

  clearTasks: () => {
    localStorage.removeItem('tasks');
  }
};

