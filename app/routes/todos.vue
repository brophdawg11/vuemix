<template>
  <div class="todos-layout">
    <h2>Todo Layout</h2>
    <p>
      This todos section container it's own nested layout which contains it's
      own <b>loader</b>, returning a message with a random number from the
      server. Then it includes nested routes for the main "/todos" route and the
      "/todos/new" route.
    </p>
    <p>Loader message: {{ message }}</p>
    <router-view />
  </div>
</template>

<script>
import { useLoaderData } from '../../vuemix/index.mjs';

export function loader() {
  return {
    message: `Hello from todos layout! ${Math.round(Math.random() * 100)}`,
  };
}

export default {
  name: 'TodosLayout',
  setup() {
    const data = useLoaderData();
    return {
      message: data.value.message,
    };
  },
};
</script>
