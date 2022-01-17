const todos = ['seeded todo #1', 'seeded todo #2'];

export function getTodos() {
  return [...todos];
}

export function addTodo(todo) {
  todos.push(todo);
}

export function removeTodo(todo) {
  const idx = todos.indexOf(todo);
  if (idx >= 0) {
    todos.splice(idx, 1);
  }
}
