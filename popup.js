// Get the elements from the popup.html file
const taskInput = document.getElementById('taskInput');
const addTaskButton = document.getElementById('addTask');
const taskList = document.getElementById('taskList');

// Load tasks from storage when the popup opens
chrome.storage.sync.get(['tasks'], (result) => {
  if (result.tasks) {
    const tasks = JSON.parse(result.tasks);
    tasks.forEach((task, index) => {
      createTaskElement(task, index);
    });
  }
});

const taskListContainer = document.getElementById('taskList');

function createTaskElement(task, index, isDone = false) {
  const taskDiv = document.createElement('div');
  taskDiv.classList.add('task');

  const taskTextDiv = document.createElement('div');
  taskTextDiv.classList.add('task-text');
  taskTextDiv.textContent = task;

  const buttonsDiv = document.createElement('div');
  buttonsDiv.classList.add('btns');

  const checkButton = document.createElement('button');
  checkButton.textContent = isDone ? 'Undo' : 'Check';
  checkButton.classList.add('li-button');
  checkButton.addEventListener('click', () => toggleDone(index));

  const editButton = document.createElement('button');
  editButton.textContent = 'Edit';
  editButton.classList.add('li-button');
  editButton.addEventListener('click', () => editTask(index));

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.classList.add('li-button');
  deleteButton.addEventListener('click', () => deleteTask(index));

  buttonsDiv.appendChild(checkButton);
  buttonsDiv.appendChild(editButton);
  buttonsDiv.appendChild(deleteButton);

  if (isDone) {
    taskTextDiv.classList.add('done');
  }

  taskDiv.appendChild(taskTextDiv);
  taskDiv.appendChild(buttonsDiv);

  taskListContainer.appendChild(taskDiv);
}

function toggleDone(index) {
  const li = taskList.children[index];
  li.classList.toggle('done');

  // Update tasks in storage
  chrome.storage.sync.get(['tasks'], (result) => {
    const tasks = result.tasks ? JSON.parse(result.tasks) : [];
    tasks[index].isDone = !tasks[index].isDone;
    chrome.storage.sync.set({ tasks: JSON.stringify(tasks) });
  });
}

// Function to add a new task
function addTask() {
  const taskText = taskInput.value.trim();
  if (taskText !== '') {
    createTaskElement(taskText);

    // Save updated tasks to storage
    chrome.storage.sync.get(['tasks'], (result) => {
      const tasks = result.tasks ? JSON.parse(result.tasks) : [];
      tasks.push(taskText);
      chrome.storage.sync.set({ tasks: JSON.stringify(tasks) });
    });

    taskInput.value = '';
  }
}

function editTask(index) {
  const taskDiv = taskListContainer.children[index];
  const taskTextDiv = taskDiv.querySelector('.task-text');
  const taskText = taskTextDiv.textContent;

  const newTaskText = prompt('Edit task:', taskText);
  if (newTaskText !== null && newTaskText.trim() !== '') {
    taskTextDiv.textContent = newTaskText;

    // Update tasks in storage
    chrome.storage.sync.get(['tasks'], (result) => {
      const tasks = result.tasks ? JSON.parse(result.tasks) : [];
      tasks[index].task = newTaskText; // Update the task text
      chrome.storage.sync.set({ tasks: JSON.stringify(tasks) });
    });

    // Remove buttons after editing
    const buttonsDiv = taskDiv.querySelector('.btns');
    buttonsDiv.innerHTML = '';

    chrome.storage.sync.get(['tasks'], (result) => {
      const tasks = result.tasks ? JSON.parse(result.tasks) : [];
      const checkButton = document.createElement('button');
      checkButton.textContent = tasks[index].isDone ? 'Undo' : 'Check';
      checkButton.classList.add('li-button');
      checkButton.addEventListener('click', () => toggleDone(index));

      const editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.classList.add('li-button');
      editButton.addEventListener('click', () => editTask(index));

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.classList.add('li-button');
      deleteButton.addEventListener('click', () => deleteTask(index));

      buttonsDiv.appendChild(checkButton);
      buttonsDiv.appendChild(editButton);
      buttonsDiv.appendChild(deleteButton);
    });
  }
}
// Function to delete a task
function deleteTask(index) {
  taskList.removeChild(taskList.children[index]);

  // Update tasks in storage
  chrome.storage.sync.get(['tasks'], (result) => {
    const tasks = result.tasks ? JSON.parse(result.tasks) : [];
    tasks.splice(index, 1);
    chrome.storage.sync.set({ tasks: JSON.stringify(tasks) });
  });
}

// Add event listeners
addTaskButton.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    addTask();
  }
});