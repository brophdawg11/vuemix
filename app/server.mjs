import fs from 'fs';

import express from 'express';

import { serverCreateApp, renderApp } from '../dist/server/app.mjs';

const server = express();

server.use('*', async (req, res, next) => {
  try {
    const context = {
      url: req.url,
    };
    const { app } = await serverCreateApp(context);
    const html = await renderApp(app, context);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (e) {
    next(e);
  }
});

server.listen(8080, () => {
  console.info('Server listening at http://localhost:8080');
});
