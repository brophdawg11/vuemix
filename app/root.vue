<template>
  <div>
    <header>
      <nav>
        <router-link to="/">Home</router-link> |
        <router-link to="/todos">Todos</router-link>
      </nav>
    </header>
    <router-view :key="$route.path" />
  </div>
</template>

<script>
import './app.css';

export default {
  name: 'AppRoot',
};
</script>
