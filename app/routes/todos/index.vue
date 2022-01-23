<template>
  <div class="todos-list">
    <h3>Todo List</h3>
    <p>
      This todo list is the main index page inside the todos layout. It's got
      it's own loader to return your list of todos from the server.
    </p>
    <ul>
      <li v-for="todo in todos" :key="todo">{{ todo }}</li>
    </ul>
    <router-link to="/todos/new">Add a New Todo</router-link> |
    <router-link to="/todos/search">Search</router-link>
    <p>
      <br />
      Take note when navigating to and from the /todos/new route that we do not
      re-run the loader for the todos layout route. But if you click back to the
      homepage and return we will re-run!
    </p>
  </div>
</template>

<script>
import { getTodos } from '../../todos.mjs';
import { useLoaderData } from '../../../vuemix/index.mjs';

export function loader() {
  const todos = getTodos();
  return { todos };
}

export default {
  name: 'TodosView',
  setup() {
    const data = useLoaderData();
    return { todos: data.value.todos };
  },
};
</script>
