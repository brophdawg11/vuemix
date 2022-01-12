<template>
  <h1>Hello {{ name }}</h1>
  <button @click="count++">Increment {{ count }}</button>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const count = ref(0);
    const name = ref('Vuemix');
    return { count, name };
  },
};
</script>
