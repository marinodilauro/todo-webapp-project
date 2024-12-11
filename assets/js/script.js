class TaskManager {
  constructor() {
    this.pendingTasksList = document.getElementById('pendingTasksList');
    this.completedTasksList = document.getElementById('completedTasksList');
    this.taskInput = document.getElementById('taskInput');
    this.taskDueDate = document.getElementById('taskDueDate');
    this.addTaskBtn = document.getElementById('addTaskBtn');

    this.addEventListeners();
    this.loadTasks();
  }

  addEventListeners() {
    this.addTaskBtn.addEventListener('click', () => this.addTask());
    this.taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTask();
    });
  }

  addTask() {
    const taskText = this.taskInput.value.trim();
    const taskDueDate = this.taskDueDate.value;

    if (!taskText) {
      alert('Please enter a task description');
      return;
    }

    const task = {
      id: Date.now(),
      text: taskText,
      dueDate: taskDueDate,
      completed: false
    };

    this.renderTask(task);
    this.saveTasks();

    // Reset input fields
    this.taskInput.value = '';
    this.taskDueDate.value = '';
  }

  getTasks() {
    return JSON.parse(localStorage.getItem('tasks')) || [];
  }

  saveTasks() {
    const tasks = this.getTasks();
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  loadTasks() {
    const tasks = this.getTasks();
    tasks.forEach(task => this.renderTask(task));
  }

  renderTask(task) {
    const taskElement = document.createElement('div');
    taskElement.classList.add('task-item', 'task-enter');
    taskElement.dataset.taskId = task.id;

    taskElement.innerHTML = `
            <div>
                <span>${task.text}</span>
                ${task.dueDate ? `<small class="text-muted ml-2">${task.dueDate}</small>` : ''}
            </div>
            <div class="task-actions">
                <button class="btn-complete" title="Complete Task">
                    <i class="fas fa-check text-success"></i>
                </button>
                <button class="btn-edit" title="Edit Task">
                    <i class="fas fa-edit text-primary"></i>
                </button>
                <button class="btn-delete" title="Delete Task">
                    <i class="fas fa-trash text-danger"></i>
                </button>
            </div>
        `;

    // Add event listeners for task actions
    const completeBtn = taskElement.querySelector('.btn-complete');
    const editBtn = taskElement.querySelector('.btn-edit');
    const deleteBtn = taskElement.querySelector('.btn-delete');

    completeBtn.addEventListener('click', () => this.toggleTaskCompletion(task.id));
    editBtn.addEventListener('click', () => this.editTask(task.id));
    deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

    // Append to appropriate list based on completion status
    if (task.completed) {
      this.completedTasksList.appendChild(taskElement);
    } else {
      this.pendingTasksList.appendChild(taskElement);
    }
  }
}

// Initialize the Task Manager when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  new TaskManager();
});