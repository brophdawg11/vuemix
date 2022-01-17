<template>
  <h1>Todos</h1>
  <ul>
    <li v-for="todo in todos" :key="todo">{{ todo }}</li>
  </ul>
  <router-link to="/todos/new">New Todo</router-link>
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
