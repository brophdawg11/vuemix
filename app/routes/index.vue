<template>
  <h1>Hello {{ name }}</h1>
  <p :style="{ color: isMounted ? 'red' : 'black' }">
    {{ isMounted ? 'Mounted!' : 'Mounting...' }}
  </p>
  <button @click="count++">Increment {{ count }}</button>
</template>

<script>
import { onMounted, ref } from 'vue';

export async function loader() {
  await new Promise((r) => setTimeout(r, 1000));
  console.log('Returning loader data');
  return { count: 1 };
}

export default {
  setup() {
    const count = ref(0);
    const name = ref('Vuemix');
    const isMounted = ref(false);
    onMounted(() => (isMounted.value = true));
    return { count, isMounted, name };
  },
};
</script>
