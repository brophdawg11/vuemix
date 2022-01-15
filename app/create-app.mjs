import { h } from 'vue';
import { createRouter } from 'vue-router';

import routes from 'vuemix:route-definition';

import RootView from './root.vue';

export default function createVuemixApp(createApp, history) {
  const app = createApp({
    render: () => h(RootView),
  });

  const router = createRouter({ history, routes });
  app.use(router);

  return { app, router };
}
