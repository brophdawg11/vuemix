import { h } from 'vue';
import { createRouter } from 'vue-router';

import RootView from './root.vue';

const routes = [
  {
    path: '/',
    component: async () => (await import('./routes/index.vue')).default,
  },
];

export default function createVuemixApp(createApp, history) {
  const app = createApp({
    render: () => h(RootView),
  });

  const router = createRouter({ history, routes });
  app.use(router);

  return { app, router };
}
