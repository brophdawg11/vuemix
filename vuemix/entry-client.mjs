import { createApp, reactive } from 'vue';
import { createWebHistory } from 'vue-router';

import { getLeafRoute, getAncestorRoutes, fetchLoaderData } from './index.mjs';
import createVuemixApp from './create-app.mjs';

const vuemixCtx = reactive({
  routeManifest: window.__vuemix.routeManifest,
  actionData: window.__vuemix.actionData,
  loaderData: window.__vuemix.loaderData,
  transition: { state: 'idle' },
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
  // Execute appropriate loaders on each client side route
  routerInstance.beforeEach(async (to, from, next) => {
    if (vuemixCtx.transition.state !== 'loading') {
      vuemixCtx.transition = {
        state: 'loading',
        type: 'load',
        location: to.path,
      };
    }

    const toRoutes = getAncestorRoutes(
      routeManifest,
      getLeafRoute(routeManifest, to),
    );
    const fromRoutes = getAncestorRoutes(
      routeManifest,
      getLeafRoute(routeManifest, from),
    );
    // Do not re-run loaders for reused ancestor routes
    const loaderRoutes = toRoutes.filter(
      ({ id, hasLoader }) => hasLoader && !fromRoutes.find((r) => r.id === id),
    );

    if (!loaderRoutes.length) {
      next();
      return;
    }

    try {
      // TODO - this runs sequentially before async route chunk loads - make it
      // run in parallel by awaiting the promise in beforeResolve
      const loaderData = await fetchLoaderData(to.path, loaderRoutes);
      Object.assign(vuemixCtx.loaderData, loaderData);
      next();
    } catch (e) {
      vuemixCtx.transition = { state: 'idle' };
      next(e);
    }
  });

  routerInstance.afterEach(() => {
    vuemixCtx.transition = { state: 'idle' };
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
