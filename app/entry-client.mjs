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

function getAncestorRoutes(manifest, route) {
  if (!route.parent) {
    return [route];
  }
  const parent = manifest[route.parent];
  return [route, ...getAncestorRoutes(manifest, parent)];
}

router.isReady().then(() => {
  router.beforeResolve(async (to, from, next) => {
    const manifestArray = Object.values(window.__vuemix.routeManifest);
    // Prefer leaf routes
    const activeRoute =
      manifestArray.find((r) => r.path === to.path && !r.layout) ||
      manifestArray.find((r) => r.path === to.path);
    const activeRoutes = getAncestorRoutes(
      window.__vuemix.routeManifest,
      activeRoute,
    );
    try {
      // TODO: Do not call re-used layout route loaders?
      if (activeRoutes.find((r) => r.hasLoader)) {
        const res = await fetch(`${to.path}?_data=${activeRoute.id}`);
        const loaderData = await res.json();
        Object.assign(vuemixCtx.loaderData, loaderData);
      }
      next();
    } catch (e) {
      next(e);
    }
  });

  app.mount('#app');
});
