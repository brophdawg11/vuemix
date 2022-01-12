import { h } from 'vue';
import { createRouter } from 'vue-router';

import IndexView from './routes/index.vue';
import RootView from './root.vue';

const routes = [
  {
    path: '/',
    component: IndexView,
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
