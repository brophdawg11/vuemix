import path from 'path';

import { build } from 'esbuild';
import pluginVue from 'esbuild-plugin-vue-next';

await build({
  entryPoints: ['app/entry-server.mjs'],
  bundle: true,
  define: {
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false,
  },
  target: 'node16',
  format: 'esm',
  outfile: 'dist/server/app.mjs',
  plugins: [pluginVue()],
});
