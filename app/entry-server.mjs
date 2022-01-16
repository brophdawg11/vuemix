import { renderToString } from '@vue/server-renderer';
import { createSSRApp } from 'vue';
import { createMemoryHistory } from 'vue-router';

import routes from 'vuemix:route-manifest';

import createVuemixApp from './create-app.mjs';

export const routeManifest = routes;

export async function serverCreateApp(context) {
  const { app, router } = createVuemixApp(createSSRApp, createMemoryHistory(), {
    actionData: context.actionData,
    loaderData: context.loaderData,
  });
  await router.push(context.url);
  await router.isReady();
  return { app, router };
}

export async function renderApp(app, context) {
  const html = await renderToString(app, context);
  return html;
}
