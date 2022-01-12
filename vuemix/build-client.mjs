import fs from 'fs';
import path from 'path';

import { build } from 'esbuild';
import pluginVue from 'esbuild-plugin-vue-next';

const result = await build({
  entryPoints: ['app/entry-client.mjs', 'app/routes/index.vue'],
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
  plugins: [pluginVue()],
});

fs.writeFileSync(
  './dist/client/meta.json',
  JSON.stringify(result.metafile, null, 4)
);
