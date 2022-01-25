<template>
  <div>
    <header>
      <nav>
        <router-link to="/">Home</router-link> |
        <router-link to="/todos">Todos</router-link>
      </nav>
      <div v-show="isLoading" class="loading">Loading...</div>
    </header>
    <router-view :key="$route.path" />
  </div>
</template>

<script>
import { computed } from 'vue';
import { useTransition } from '../vuemix/index.mjs';
import './app.css';

export default {
  name: 'AppRoot',
  setup() {
    const transition = useTransition();
    return {
      isLoading: computed(() => transition.value.state !== 'idle'),
    };
  },
};
</script>
