import fs from 'fs';

// eslint-disable-next-line import/no-extraneous-dependencies
import { build } from 'esbuild';
// eslint-disable-next-line import/no-extraneous-dependencies
import pluginVue from 'esbuild-plugin-vue-next';

import { routeDefinitionPlugin } from './route-plugins.mjs';

async function buildClient() {
  const result = await build({
    entryPoints: ['app/entry-client.mjs'],
    bundle: true,
    define: {
      __VUE_OPTIONS_API__: false,
      __VUE_PROD_DEVTOOLS__: false,
    },
    format: 'esm',
    metafile: true,
    splitting: true,
    target: 'es2020',
    outdir: 'dist/client',
    plugins: [routeDefinitionPlugin({ type: 'client' }), pluginVue()],
  });

  fs.writeFileSync(
    './dist/client/meta.json',
    JSON.stringify(result.metafile, null, 4),
  );
}

buildClient();
