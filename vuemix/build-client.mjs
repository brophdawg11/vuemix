import fs from 'fs';

// eslint-disable-next-line import/no-extraneous-dependencies
import { build } from 'esbuild';
// eslint-disable-next-line import/no-extraneous-dependencies
import pluginVue from 'esbuild-plugin-vue-next';

import vuemixPlugin from './esbuild-plugin.mjs';

async function buildClient() {
  const result = await build({
    entryPoints: ['vuemix/entry-client.mjs'],
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
    plugins: [
      // TODO: Hack?  node-fetch seems to still be processed by esbuild even though
      // it's downstream of an action.  This marks internal node built-in dependencies
      // it references as external so the build doesn't fail
      {
        name: 'client-node-external',
        setup(b) {
          b.onResolve({ filter: /^node:/ }, () => ({ external: true }));
        },
      },
      vuemixPlugin({ type: 'client' }),
      pluginVue(),
    ],
    watch: process.env.WATCH === 'true',
  });

  fs.writeFileSync(
    './dist/client/meta.json',
    JSON.stringify(result.metafile, null, 4),
  );
}

buildClient();
