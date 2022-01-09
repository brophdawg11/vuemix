<template>
  <h1>Hello {{ name }}</h1>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const name = ref('Vuemix');
    return { name };
  },
};
</script>
