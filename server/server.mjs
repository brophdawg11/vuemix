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

server.all('*', async (req, res, next) => {
  try {
    const { url } = req;

    const activeRoute = Object.values(routeManifest).find(
      (r) => r.path === url
    );
    if (!activeRoute) {
      throw new Error(`Not Found: ${req.url}`);
    }

    const context = {
      url,
      loaderData: {},
    };
    const { app } = await serverCreateApp(context);
    if (activeRoute.loader) {
      const loaderData = await activeRoute.loader();
      context.loaderData[activeRoute.id] = loaderData;
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
