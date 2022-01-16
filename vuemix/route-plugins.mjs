import path from 'path';
import fs, { statSync } from 'fs';

const dirname = new URL('.', import.meta.url).pathname;
const routeDir = path.join(dirname, '../app/routes');

// Recursivly read the routes/ directory and generate a flat array of files
async function readRoutesDirectory(dir) {
  let files = [];
  const rootDir = dir ? path.join(routeDir, dir) : routeDir;
  const dirContents = await fs.promises.readdir(rootDir);
  for (let i = 0; i < dirContents.length; i++) {
    const entryPath = path.join(rootDir, dirContents[i]);
    const stats = await fs.promises.stat(entryPath);
    const relativePath = dir ? path.join(dir, dirContents[i]) : dirContents[i];
    if (!stats.isDirectory()) {
      files.push(relativePath);
    } else {
      const nested = await readRoutesDirectory(relativePath);
      files.push(...nested);
    }
  }
  return files;
}

// Generate a vue-router path from a relative route file path
function getPathFromFileName(file) {
  if (file === 'index.vue') {
    return '/';
  }
  if (file.endsWith('index.vue')) {
    return `/${path.dirname(file)}`;
  }
  return `/${path.join(path.dirname(file), path.basename(file, '.vue'))}`;
}

// Provide a virtual module to import vue-router routes from 'vuemix:route-definition'
export function routeDefinitionPlugin({ type }) {
  return {
    name: 'route-definition',
    setup(build) {
      build.onResolve({ filter: /^vuemix:route-definition$/ }, async (args) => {
        return {
          path: args.path,
          namespace: 'route-definition',
        };
      });

      build.onLoad(
        { filter: /.*/, namespace: 'route-definition' },
        async (args) => {
          const files = await readRoutesDirectory();
          const getImport = (f) => f + (type === 'client' ? '?client' : '');
          const contents = `
import { h } from 'vue';

import { VuemixRoute } from '../../vuemix/index.mjs';

export default [
  ${files.map(
    (f) => `{
      id: '${f}',
      path: '${getPathFromFileName(f)}',
      component: async () => {
        const cmp = (await import('./${getImport(f)}')).default;
        return () => h(VuemixRoute, { id: '${f}' }, () => h(cmp));
      },
    }`
  )}
];
`;
          return {
            resolveDir: routeDir,
            contents,
            loader: 'js',
          };
        }
      );

      build.onResolve({ filter: /^vuemix:route-manifest$/ }, async (args) => {
        return {
          path: args.path,
          namespace: 'route-manifest',
        };
      });

      build.onLoad(
        { filter: /.*/, namespace: 'route-manifest' },
        async (args) => {
          const files = await readRoutesDirectory();
          const contents = `
${files.map((f, i) => `import * as m_${i} from './${f}';`).join('\n')}

export default {
  ${files
    .map(
      (f, i) => `'${f}': {
    id: '${f}',
    path: '${getPathFromFileName(f)}',
    loader: typeof m_${i}.loader === 'undefined' ? null : m_${i}.loader,
  }`
    )
    .join(',\n  ')}
};
`;
          return {
            resolveDir: routeDir,
            contents,
            loader: 'js',
          };
        }
      );

      build.onResolve({ filter: /\.vue\?client$/ }, async (args) => {
        return {
          path: args.path,
          namespace: 'route-client-stub',
        };
      });

      build.onLoad(
        { filter: /.*/, namespace: 'route-client-stub' },
        async (args) => {
          const files = await readRoutesDirectory();
          const contents = `
import component from '${args.path.replace('?client', '')}';
export default component;
`;
          return {
            resolveDir: routeDir,
            contents,
            loader: 'js',
          };
        }
      );
    },
  };
}
