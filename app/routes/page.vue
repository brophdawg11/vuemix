<template>
  <h1>Hello Page</h1>
  <p>Count: {{ count }}</p>
</template>

<script>
import { useLoaderData } from '../../vuemix/index.mjs';

export async function loader() {
  await new Promise((r) => setTimeout(r, 1000));
  return { count: Math.round(Math.random() * 1000) };
}

export default {
  setup() {
    const loaderData = useLoaderData();
    return { count: loaderData?.count };
  },
};
</script>
