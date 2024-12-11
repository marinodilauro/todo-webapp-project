'use client'

document.addEventListener('DOMContentLoaded', () => {
  const taskForm = document.getElementById('task-form');
  const taskInput = document.getElementById('task-input');
  const pendingTasksList = document.getElementById('pending-tasks');
  const completedTasksList = document.getElementById('completed-tasks');

  let tasks = [];

  function showModal(type, message) {
    const modalId = type === 'success' ? 'successModal' : 'errorModal';
    const modalElement = document.getElementById(modalId);
    const modalBodyId = type === 'success' ? 'successModalBody' : 'errorModalBody';
    document.getElementById(modalBodyId).textContent = message;

    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    setTimeout(() => modal.hide(), 3000);
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
                  ${!task.completed ? `
                      <button class="btn btn-sm btn-outline-success toggle-task" data-id="${task.id}">
                          <i class="fas fa-check"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-primary edit-task" data-id="${task.id}">
                          <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger delete-task" data-id="${task.id}">
                          <i class="fas fa-trash"></i>
                      </button>
                      ` : `
                      <button class="btn btn-sm btn-outline-danger delete-task" data-id="${task.id}">
                          <i class="fas fa-trash"></i>
                      </button>`}
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
      showModal('error', 'Failed to load tasks from the server. Showing cached tasks.');
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
        showModal('success', 'Task added successfully!');
      } catch (error) {
        console.error('Failed to add task:', error);
        showModal('error', 'Failed to add task. Please try again.');
      }
    }
  });

  document.addEventListener('click', async (e) => {
    if (e.target.closest('.edit-task')) {
      const taskId = e.target.closest('.edit-task').dataset.id;
      const taskElement = e.target.closest('.task-item').querySelector('span');
      const editModal = new bootstrap.Modal(document.getElementById('editTaskModal'));
      const editTaskInput = document.getElementById('editTaskInput');
      const saveEditTaskBtn = document.getElementById('saveEditTaskBtn');

      editTaskInput.value = taskElement.textContent;
      editModal.show();

      saveEditTaskBtn.onclick = async () => {
        const newContent = editTaskInput.value.trim();
        if (newContent !== '') {
          try {
            await TodoistAPI.updateTask(taskId, { content: newContent });
            const taskIndex = tasks.findIndex(t => t.id === taskId);
            tasks[taskIndex].content = newContent;
            StorageManager.saveTasks(tasks);
            renderTasks();
            editModal.hide();
            showModal('success', 'Task updated successfully!');
          } catch (error) {
            console.error('Failed to update task:', error);
            showModal('error', 'Failed to update task. Please try again.');
          }
        }
      };
    } else if (e.target.closest('.delete-task')) {
      const taskId = e.target.closest('.delete-task').dataset.id;
      const deleteModal = new bootstrap.Modal(document.getElementById('deleteTaskModal'));
      const confirmDeleteTaskBtn = document.getElementById('confirmDeleteTaskBtn');

      deleteModal.show();

      confirmDeleteTaskBtn.onclick = async () => {
        try {
          await TodoistAPI.deleteTask(taskId);
          const taskElement = e.target.closest('.task-item');
          taskElement.classList.add('removing');
          setTimeout(() => {
            tasks = tasks.filter(t => t.id !== taskId);
            StorageManager.saveTasks(tasks);
            renderTasks();
          }, 500);
          deleteModal.hide();
          showModal('success', 'Task deleted successfully!');
        } catch (error) {
          console.error('Failed to delete task:', error);
          showModal('error', 'Failed to delete task. Please try again.');
        }
      };
    } else if (e.target.closest('.toggle-task')) {
      const taskId = e.target.closest('.toggle-task').dataset.id;
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      const newStatus = !tasks[taskIndex].completed;
      try {
        if (newStatus) {
          await TodoistAPI.closeTask(taskId);
        } else {
          // When reopening a task, we need to send a valid field
          await TodoistAPI.updateTask(taskId, { completed: false });
        }
        tasks[taskIndex].completed = newStatus;
        StorageManager.saveTasks(tasks);
        renderTasks();
        showModal('success', `Task marked as ${newStatus ? 'completed' : 'pending'} !`);
      } catch (error) {
        console.error('Failed to update task status:', error);
        showModal('error', `Failed to update task status: ${error.message} `);
      }
    }
  });

  loadTasks();
});

