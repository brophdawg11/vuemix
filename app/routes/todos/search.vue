<template>
  <div class="todos-search">
    <h3>Search for TODOs</h3>
    <VuemixForm method="get">
      <input name="query" />
      <button type="submit" :disabled="isSearching">
        {{ isSearching ? 'Searching...' : 'Search' }}
      </button>
    </VuemixForm>
    <router-link to="/todos">Cancel</router-link>
    <div v-if="transition.submission != null">
      <i>Searching...</i>
    </div>
    <div v-else-if="data.todos.length > 0">
      <h3>Results for "{{ data.query }}"</h3>
      <ul>
        <li v-for="todo in data.todos" :key="todo">{{ todo }}</li>
      </ul>
    </div>
    <div v-else-if="data.query">
      <h3>No results found</h3>
    </div>
    <p>
      <br />
      Note that this form submits to itself with a GET request
    </p>
  </div>
</template>

<script>
import {
  VuemixForm,
  useTransition,
  useLoaderData,
} from '../../../vuemix/index.mjs';
import { getTodos } from '../../todos.mjs';

export async function loader({ request }) {
  const { query } = request.query;
  const todos = getTodos().filter((t) => t.includes(query));
  await new Promise((r) => {
    setTimeout(r, 100);
  });
  return {
    todos,
    query,
  };
}

export default {
  name: 'SearchTodoView',
  components: {
    VuemixForm,
  },
  setup() {
    const transition = useTransition();
    const data = useLoaderData();
    return {
      data,
      transition,
    };
  },
};
</script>
