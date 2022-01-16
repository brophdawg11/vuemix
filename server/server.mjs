import fs from 'fs';
import { URL } from 'url';

import express from 'express';

import {
  renderApp,
  routeManifest,
  serverCreateApp,
} from '../dist/server/app.mjs';

const server = express();

server.use(express.urlencoded({ extended: true }));

server.get('/favicon.ico', (req, res) => res.status(404).send('Not Found'));

const dirname = new URL('.', import.meta.url).pathname;
server.get(/\.(css|js)$/, express.static(`${dirname}../dist/client`));

const clientRouteManifest = Object.entries(routeManifest).reduce(
  (acc, [k, v]) =>
    Object.assign(acc, {
      [k]: {
        ...v,
        loader: undefined,
        hasAction: typeof v.action === 'function',
        hasLoader: typeof v.loader === 'function',
      },
    }),
  {},
);
server.all('*', async (req, res, next) => {
  try {
    const activeRoute = Object.values(routeManifest).find(
      (r) => r.path === req.path,
    );
    if (!activeRoute) {
      res.status(404).send(`Not Found: ${req.url}`);
      return;
    }

    const context = {
      url: req.url,
      actionData: null,
      loaderData: {},
    };

    if (!['GET', 'POST'].includes(req.method)) {
      res.status(405).send('Unsupported method');
      return;
    }

    // Run appropriate loader/action methods and return JSON responses if
    // these were fetch requests
    if (req.method === 'GET') {
      context.loaderData[activeRoute.id] = await (activeRoute.loader
        ? activeRoute.loader()
        : Promise.resolve(null));
      if (req.query._data) {
        res.send(context.loaderData[activeRoute.id]);
        return;
      }
    } else {
      if (!activeRoute.action) {
        res.status(500).send('No action provided');
        return;
      }
      context.actionData = await activeRoute.action({ formData: req.body });
      if (req.query._action) {
        res.send(context.actionData);
        return;
      }
    }

    // Not fetch requests - perform full SSR
    const { app } = await serverCreateApp(context);
    const html = await renderApp(app, context);
    const hydrateObj = (v) =>
      `JSON.parse(${JSON.stringify(JSON.stringify(v))})`;
    const page = `<!DOCTYPE html>
<html>
   <head>
       <title>Vuemix</title>
   </head>
   <body>
       <div id="app">${html}</div>
       <script>
       window.__vuemix = {
        routeManifest: ${hydrateObj(clientRouteManifest)},
        actionData: ${hydrateObj(context.actionData)},
        loaderData: ${hydrateObj(context.loaderData)}
       };
       </script>
       <script src="/entry-client.js" type="module"></script>
   </body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    res.send(page);
  } catch (e) {
    next(e);
  }
});

server.listen(8080, () => {
  console.info('Server listening at http://localhost:8080');
});
