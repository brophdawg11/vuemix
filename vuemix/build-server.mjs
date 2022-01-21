/* eslint-disable import/no-extraneous-dependencies */

import fs from 'fs';

import { build } from 'esbuild';
import pluginVue from 'esbuild-plugin-vue-next';

import vuemixPlugin from './esbuild-plugin.mjs';

async function buildServer() {
  const result = await build({
    entryPoints: ['app/entry-server.mjs'],
    bundle: true,
    define: {
      __VUE_OPTIONS_API__: false,
      __VUE_PROD_DEVTOOLS__: false,
    },
    metafile: true,
    platform: 'node',
    target: 'node16',
    format: 'esm',
    outfile: 'dist/server/app.mjs',
    plugins: [
      {
        name: 'server-node-external',
        setup(b) {
          b.onResolve({ filter: /^node-fetch$/ }, () => ({ external: true }));
        },
      },
      vuemixPlugin({ type: 'server' }),
      pluginVue(),
    ],
    watch: process.env.WATCH === 'true',
  });

  fs.writeFileSync(
    './dist/server/meta.json',
    JSON.stringify(result.metafile, null, 4),
  );
}

buildServer();
