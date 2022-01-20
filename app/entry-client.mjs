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

function useClientSideLoaders(routerInstance, routeManifest) {
  const routeManifestArray = Object.values(routeManifest);

  // Prefer leaf routes over layout routes in dup path scenarios
  function getLeafRoute({ path }) {
    return (
      routeManifestArray.find((r) => r.path === path && !r.layout) ||
      routeManifestArray.find((r) => r.path === path)
    );
  }

  // Return an array of the route hierarchy, ending with the provided route
  function getAncestorRoutes(manifest, route) {
    if (!route.parent) {
      return [route];
    }
    const parent = manifest[route.parent];
    return [route, ...getAncestorRoutes(manifest, parent)];
  }

  // Execute appropriate loaders on each client side route
  routerInstance.beforeResolve(async (to, from, next) => {
    const toRoutes = getAncestorRoutes(routeManifest, getLeafRoute(to));
    const fromRoutes = getAncestorRoutes(routeManifest, getLeafRoute(from));
    // Do not re-run loaders for reused ancestor routes
    const loaderRoutes = toRoutes.filter(
      ({ id, hasLoader }) => hasLoader && !fromRoutes.find((r) => r.id === id),
    );

    if (!loaderRoutes.length) {
      next();
      return;
    }

    try {
      const qs = new URLSearchParams({
        _data: loaderRoutes.map((r) => r.id).join(','),
      });
      const res = await fetch(`${to.path}?${qs}`);
      const loaderData = await res.json();
      Object.assign(vuemixCtx.loaderData, loaderData);
      next();
    } catch (e) {
      next(e);
    }
  });
}

router.onError((err) => {
  // eslint-disable-next-line no-console
  console.error('Router Error:', err);
});

router.isReady().then(() => {
  useClientSideLoaders(router, window.__vuemix.routeManifest);
  app.mount('#app');
});
