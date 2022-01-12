import path from 'path';

import { build } from 'esbuild';
import pluginVue from 'esbuild-plugin-vue-next';

await build({
  entryPoints: ['app/entry-client.mjs'],
  bundle: true,
  define: {
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false,
  },
  target: 'es2020',
  outfile: 'dist/client/app.js',
  plugins: [pluginVue()],
});
