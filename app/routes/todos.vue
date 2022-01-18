<template>
  <h2>Todos Layout Header</h2>
  <p>Message from loader: {{ message }}</p>
  <router-view />
  <p>Todos layout footer</p>
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
