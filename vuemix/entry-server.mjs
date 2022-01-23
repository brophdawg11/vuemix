import { renderToString } from '@vue/server-renderer';
import { createMemoryHistory } from 'vue-router';

// eslint-disable-next-line import/no-unresolved
import routes from 'vuemix:route-manifest';

import createVuemixApp from './create-app.mjs';

export const routeManifest = routes;

export async function serverCreateApp(context) {
  const { app, router } = createVuemixApp(createMemoryHistory(), {
    routeManifest,
    actionData: context.actionData,
    loaderData: context.loaderData,
    transition: { state: 'idle' },
  });
  await router.push(context.url);
  await router.isReady();
  return { app, router };
}

export async function renderApp(app, context) {
  const html = await renderToString(app, context);
  return html;
}
