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
  let loaderPromise;

  // Start loader fetches in parallel with async chunk loads
  routerInstance.beforeEach(async (to, from, next) => {
    const toLeafRoute = getLeafRoute(routeManifest, to);
    const toRoutes = getAncestorRoutes(routeManifest, toLeafRoute);
    const fromRoutes = getAncestorRoutes(
      routeManifest,
      getLeafRoute(routeManifest, from),
    );
    // Do not re-run loaders for reused ancestor routes, but always ensure we run
    // the loader for the destinaiton leaf route since we may have query param changes
    const loaderRoutes = toRoutes.filter(
      ({ id, hasLoader }) =>
        hasLoader &&
        (id === toLeafRoute.id || !fromRoutes.find((r) => r.id === id)),
    );

    if (!loaderRoutes.length) {
      next();
      return;
    }

    // Only set transition on normal link clicks.  If this is a redirect or
    // GET-form submission we'll have set this already
    if (vuemixCtx.transition.state === 'idle') {
      vuemixCtx.transition = {
        state: 'loading',
        type: 'load',
        location: to.path,
      };
    }
    loaderPromise = fetchLoaderData(to.fullPath, loaderRoutes);
    next();
  });

  // Await loader fetches prior to approving route transition
  routerInstance.beforeResolve(async (to, from, next) => {
    try {
      const loaderData = await loaderPromise;
      Object.assign(vuemixCtx.loaderData, loaderData);
      next();
    } catch (e) {
      vuemixCtx.transition = { state: 'idle' };
      next(e);
    }
  });

  // Complete route transition
  routerInstance.afterEach(() => {
    vuemixCtx.transition = { state: 'idle' };
  });

  router.onError(() => {
    loaderPromise = null;
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
