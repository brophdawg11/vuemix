<template>
  <div>
    <header>
      <router-link to="/">Home</router-link> |
      <router-link to="/page">Page</router-link> |
      <router-link to="/nested">Nested Index</router-link> |
      <router-link to="/nested/page">Nested Page</router-link>
    </header>
    <router-view :key="$route.path" />
    <footer>Footer</footer>
  </div>
</template>

<script>
export default {};
</script>
