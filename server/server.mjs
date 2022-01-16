import fs from 'fs';
import { URL } from 'url';

import express from 'express';

import {
  renderApp,
  routeManifest,
  serverCreateApp,
} from '../dist/server/app.mjs';

const server = express();

server.get('/favicon.ico', (req, res) => res.status(404).send('Not Found'));

const dirname = new URL('.', import.meta.url).pathname;
server.get(/\.(css|js)$/, express.static(`${dirname}../dist/client`));

const clientRouteManifest = Object.entries(routeManifest).reduce(
  (acc, [k, v]) =>
    Object.assign(acc, {
      [k]: {
        ...v,
        loader: undefined,
        hasLoader: typeof v.loader === 'function',
      },
    }),
  {}
);
server.all('*', async (req, res, next) => {
  try {
    const activeRoute = Object.values(routeManifest).find(
      (r) => r.path === req.path
    );
    if (!activeRoute) {
      throw new Error(`Not Found: ${req.url}`);
    }

    const { id, loader } = activeRoute;

    if (req.query._data) {
      const loaderData = await loader();
      res.send(loaderData);
      return;
    }

    const context = {
      url: req.url,
      loaderData: {},
    };
    const { app } = await serverCreateApp(context);
    if (loader) {
      const loaderData = await loader();
      context.loaderData[id] = loaderData;
    }
    const html = await renderApp(app, context);
    const page = `<!DOCTYPE html>
<html>
   <head>
       <title>Vuemix</title>
   </head>
   <body>
       <div id="app">${html}</div>
       <script>
       window.__vuemix = {
        routeManifest: JSON.parse(${JSON.stringify(
          JSON.stringify(clientRouteManifest)
        )}),
        loaderData: JSON.parse(${JSON.stringify(
          JSON.stringify(context.loaderData)
        )})
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
