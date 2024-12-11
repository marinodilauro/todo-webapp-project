'use client'

document.addEventListener('DOMContentLoaded', () => {
  const taskForm = document.getElementById('task-form');
  const taskInput = document.getElementById('task-input');
  const pendingTasksList = document.getElementById('pending-tasks');
  const completedTasksList = document.getElementById('completed-tasks');
  const errorMessage = document.getElementById('error-message');
  const successMessage = document.getElementById('success-message');

  let tasks = [];

  function showMessage(element, message) {
    element.textContent = message;
    element.classList.remove('d-none');
    setTimeout(() => {
      element.classList.add('d-none');
    }, 3000);
  }

  function renderTasks() {
    pendingTasksList.innerHTML = '';
    completedTasksList.innerHTML = '';

    tasks.forEach(task => {
      const li = document.createElement('li');
      li.className = `list-group-item task-item ${task.isNew ? 'new-task' : ''}`;
      li.innerHTML = `
                <span class="${task.completed ? 'completed-task' : ''}">${task.content}</span>
                <div class="task-actions">
                    <button class="btn btn-sm btn-outline-primary edit-task" data-id="${task.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-task" data-id="${task.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success toggle-task" data-id="${task.id}">
                        <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
                    </button>
                </div>
            `;

      if (task.completed) {
        completedTasksList.appendChild(li);
      } else {
        pendingTasksList.appendChild(li);
      }

      if (task.isNew) {
        setTimeout(() => {
          li.classList.remove('new-task');
        }, 500);
      }
    });
  }

  async function loadTasks() {
    try {
      const apiTasks = await TodoistAPI.getTasks();
      tasks = apiTasks.map(task => ({ ...task, isNew: false }));
      StorageManager.saveTasks(tasks);
      renderTasks();
    } catch (error) {
      console.error('Failed to load tasks:', error);
      tasks = StorageManager.getTasks();
      renderTasks();
      showMessage(errorMessage, 'Failed to load tasks from the server. Showing cached tasks.');
    }
  }

  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = taskInput.value.trim();
    if (content) {
      try {
        const newTask = await TodoistAPI.createTask(content);
        tasks.unshift({ ...newTask, isNew: true });
        StorageManager.saveTasks(tasks);
        renderTasks();
        taskInput.value = '';
        showMessage(successMessage, 'Task added successfully!');
      } catch (error) {
        console.error('Failed to add task:', error);
        showMessage(errorMessage, 'Failed to add task. Please try again.');
      }
    }
  });

  document.addEventListener('click', async (e) => {
    if (e.target.closest('.edit-task')) {
      const taskId = e.target.closest('.edit-task').dataset.id;
      const taskElement = e.target.closest('.task-item').querySelector('span');
      const newContent = prompt('Edit task:', taskElement.textContent);
      if (newContent !== null && newContent.trim() !== '') {
        try {
          await TodoistAPI.updateTask(taskId, { content: newContent });
          const taskIndex = tasks.findIndex(t => t.id === taskId);
          tasks[taskIndex].content = newContent;
          StorageManager.saveTasks(tasks);
          renderTasks();
          showMessage(successMessage, 'Task updated successfully!');
        } catch (error) {
          console.error('Failed to update task:', error);
          showMessage(errorMessage, 'Failed to update task. Please try again.');
        }
      }
    } else if (e.target.closest('.delete-task')) {
      const taskId = e.target.closest('.delete-task').dataset.id;
      if (confirm('Are you sure you want to delete this task?')) {
        try {
          await TodoistAPI.deleteTask(taskId);
          const taskElement = e.target.closest('.task-item');
          taskElement.classList.add('removing');
          setTimeout(() => {
            tasks = tasks.filter(t => t.id !== taskId);
            StorageManager.saveTasks(tasks);
            renderTasks();
          }, 500);
          showMessage(successMessage, 'Task deleted successfully!');
        } catch (error) {
          console.error('Failed to delete task:', error);
          showMessage(errorMessage, 'Failed to delete task. Please try again.');
        }
      }
    } else if (e.target.closest('.toggle-task')) {
      const taskId = e.target.closest('.toggle-task').dataset.id;
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      const newStatus = !tasks[taskIndex].completed;
      try {
        if (newStatus) {
          await TodoistAPI.closeTask(taskId);
        } else {
          await TodoistAPI.updateTask(taskId, { completed: false });
        }
        tasks[taskIndex].completed = newStatus;
        StorageManager.saveTasks(tasks);
        renderTasks();
        showMessage(successMessage, `Task marked as ${newStatus ? 'completed' : 'pending'}!`);
      } catch (error) {
        console.error('Failed to update task status:', error);
        showMessage(errorMessage, 'Failed to update task status. Please try again.');
      }
    }
  });

  loadTasks();
});

