<template>
  <h1>Hello Vuemix</h1>
  <p :style="{ color: isMounted ? 'red' : 'black' }">
    {{ isMounted ? 'Mounted!' : 'Mounting...' }}
  </p>
  <button @click="count++">Increment {{ count }}</button>
</template>

<script>
import { inject, onMounted, ref } from 'vue';

import { useLoaderData } from '../../vuemix/index.mjs';

export async function loader() {
  await new Promise((r) => setTimeout(r, 1000));
  return { count: 1 };
}

export default {
  name: 'IndexView',
  setup() {
    const loaderData = useLoaderData();

    const count = ref(loaderData?.count);

    const isMounted = ref(false);
    onMounted(() => (isMounted.value = true));

    return {
      count,
      isMounted,
    };
  },
};
</script>
