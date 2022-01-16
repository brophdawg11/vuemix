import fs from 'fs';

// eslint-disable-next-line import/no-extraneous-dependencies
import { build } from 'esbuild';
// eslint-disable-next-line import/no-extraneous-dependencies
import pluginVue from 'esbuild-plugin-vue-next';

import { routeDefinitionPlugin } from './route-plugins.mjs';

async function buildServer() {
  const result = await build({
    entryPoints: ['app/entry-server.mjs'],
    bundle: true,
    define: {
      __VUE_OPTIONS_API__: false,
      __VUE_PROD_DEVTOOLS__: false,
    },
    metafile: true,
    target: 'node16',
    format: 'esm',
    outfile: 'dist/server/app.mjs',
    plugins: [routeDefinitionPlugin({ type: 'server' }), pluginVue()],
  });

  fs.writeFileSync(
    './dist/server/meta.json',
    JSON.stringify(result.metafile, null, 4),
  );
}

buildServer();
