const STORAGE_KEY = "student-todo-list-v1";
const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const list = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const taskCount = document.querySelector("#task-count");
const remainingCount = document.querySelector("#remaining-count");
const clearCompletedButton = document.querySelector("#clear-completed");
const filterButtons = [...document.querySelectorAll("[data-filter]")];

let tasks = loadTasks();
let currentFilter = "all";

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter(task =>
      task && typeof task.id === "string" &&
      typeof task.text === "string" && typeof task.done === "boolean"
    ) : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    alert("Your browser could not save tasks. You can still use the list while this page is open.");
  }
}

function createTask(text) {
  tasks.unshift({ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, text, done: false });
  saveTasks();
  render();
}

function makeButton(label, className, onClick, title = label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.title = title;
  button.setAttribute("aria-label", title);
  button.addEventListener("click", onClick);
  return button;
}

function render() {
  list.replaceChildren();
  const visibleTasks = tasks.filter(task =>
    currentFilter === "all" ||
    (currentFilter === "pending" && !task.done) ||
    (currentFilter === "completed" && task.done)
  );

  for (const task of visibleTasks) {
    const item = document.createElement("li");
    item.className = `task-item${task.done ? " done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", `Mark "${task.text}" as ${task.done ? "pending" : "completed"}`);
    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      saveTasks();
      render();
    });

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const actions = document.createElement("div");
    actions.className = "task-actions";
    actions.append(
      makeButton("Edit", "icon-button", () => editTask(task), `Edit task: ${task.text}`),
      makeButton("Delete", "icon-button delete", () => {
        tasks = tasks.filter(candidate => candidate.id !== task.id);
        saveTasks();
        render();
      }, `Delete task: ${task.text}`)
    );

    item.append(checkbox, text, actions);
    list.append(item);
  }

  const completed = tasks.filter(task => task.done).length;
  const remaining = tasks.length - completed;
  taskCount.textContent = `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;
  remainingCount.textContent = `${remaining} ${remaining === 1 ? "task" : "tasks"} remaining`;
  emptyState.hidden = visibleTasks.length !== 0;
  list.hidden = visibleTasks.length === 0;
  clearCompletedButton.disabled = completed === 0;

  filterButtons.forEach(button => {
    const active = button.dataset.filter === currentFilter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function editTask(task) {
  const updated = prompt("Edit task:", task.text);
  if (updated === null) return;
  const text = updated.trim();
  if (!text) {
    alert("Task cannot be empty.");
    return;
  }
  task.text = text.slice(0, 160);
  saveTasks();
  render();
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  createTask(text.slice(0, 160));
  input.value = "";
  input.focus();
});

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    render();
  });
});

clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter(task => !task.done);
  saveTasks();
  render();
});

render();
