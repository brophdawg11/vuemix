<template>
  <h1>Hello {{ name }}</h1>
  <p :style="{ color: isMounted ? 'red' : 'black' }">
    {{ isMounted ? 'Mounted!' : 'Mounting...' }}
  </p>
  <button @click="count++">Increment {{ count }}</button>
</template>

<script>
import { onMounted, ref } from 'vue';


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
