import fs from 'fs';
import { URL } from 'url';

import express from 'express';

import { serverCreateApp, renderApp } from '../dist/server/app.mjs';

const server = express();

const dirname = new URL('.', import.meta.url).pathname;
server.get(/\.(css|js)$/, express.static(`${dirname}../dist/client`));

server.all('*', async (req, res, next) => {
  try {
    const context = {
      url: req.url,
    };
    const { app } = await serverCreateApp(context);
    const html = await renderApp(app, context);
    const page = `<!DOCTYPE html>
<html>
   <head>
       <title>Vuemix</title>
   </head>
   <body>
       <div id="app">${html}</div>
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
