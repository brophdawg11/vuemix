import { createApp, reactive } from 'vue';
import { createWebHistory } from 'vue-router';

import createVuemixApp from './create-app.mjs';

const vuemixCtx = reactive({
  actionData: window.__vuemix.actionData,
  loaderData: window.__vuemix.loaderData,
});

const { app, router } = createVuemixApp(
  createApp,
  createWebHistory(),
  vuemixCtx,
);

window.__vuemix.app = app;
window.__vuemix.router = router;
window.__vuemix.ctx = vuemixCtx;

router.isReady().then(() => {
  router.beforeResolve(async (to, from, next) => {
    const activeRoute = Object.values(window.__vuemix.routeManifest).find(
      (r) => r.path === to.path,
    );
    try {
      if (activeRoute && activeRoute.hasLoader) {
        const res = await fetch(`${to.path}?_data=${activeRoute.id}`);
        const loaderData = await res.json();
        vuemixCtx.loaderData[activeRoute.id] = loaderData;
      }
      next();
    } catch (e) {
      next(e);
    }
  });

  app.mount('#app');
});
