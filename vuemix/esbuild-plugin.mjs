import path from 'path';
import fs from 'fs';

const dirname = new URL('.', import.meta.url).pathname;
const routeDir = path.join(dirname, '../app/routes');

const generateRelativePath = (d, f) => (d ? path.join(d, f) : f);

// Recursivly read the routes/ directory and generate a flat array of files
async function readRoutesDirectory(dir) {
  const files = [];
  const rootDir = dir ? path.join(routeDir, dir) : routeDir;
  const dirContents = await fs.promises.readdir(rootDir);
  for (let i = 0; i < dirContents.length; i++) {
    const entryPath = path.join(rootDir, dirContents[i]);
    // TODO: Optimize
    // eslint-disable-next-line no-await-in-loop
    const stats = await fs.promises.stat(entryPath);
    const relativePath = generateRelativePath(dir, dirContents[i]);
    if (stats.isDirectory()) {
      const parent =
        dirContents[i] === path.basename(dirContents[i + 1], '.vue')
          ? generateRelativePath(dir, dirContents[i + 1])
          : null;
      // TODO: Optimize
      // eslint-disable-next-line no-await-in-loop
      const nested = await readRoutesDirectory(relativePath);
      files.push(
        ...nested.map((n) => ({
          ...n,
          ...(parent ? { parent } : {}),
        })),
      );
    } else {
      const layout =
        dirContents[i - 1] &&
        dirContents[i - 1] === path.basename(dirContents[i], '.vue');
      files.push({ path: relativePath, ...(layout ? { layout } : {}) });
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

// Define a virtual module for the server route manifest.  The server passes the
// manifest up to the client in a slightly modified form so this is safe to be an
// SSR-only import
function defineServerRouteManifestVirtualModule(build, filesPromise) {
  build.onResolve({ filter: /^vuemix:route-manifest$/ }, async (args) => ({
    path: args.path,
    namespace: 'route-manifest',
  }));

  build.onLoad({ filter: /.*/, namespace: 'route-manifest' }, async () => {
    const files = await filesPromise;
    const contents = `
${files.map((f, i) => `import * as m_${i} from './${f.path}';`).join('\n')}

export default {
  ${files
    .map(
      (f, i) => `'${f.path}': {
    id: '${f.path}',
    path: '${getPathFromFileName(f.path)}',
    parent: ${f.parent ? `'${f.parent}'` : 'null'},
    layout: ${f.layout === true},
    action: typeof m_${i}.action === 'undefined' ? null : m_${i}.action,
    loader: typeof m_${i}.loader === 'undefined' ? null : m_${i}.loader,
  }`,
    )
    .join(',\n  ')}
};
`;
    return {
      resolveDir: routeDir,
      contents,
      loader: 'js',
    };
  });
}

// Virtual module to provide vue-router `routes` parameter based on routes/ directory
// structure.
//
//  Example:
//    import routes from 'vuemix:route-definition';
//    const router = createRouter({ routes, ... });
function defineRouteDefinitionVirtualModule(build, filesPromise, type) {
  build.onResolve({ filter: /^vuemix:route-definition$/ }, async (args) => ({
    path: args.path,
    namespace: 'route-definition',
  }));

  build.onLoad({ filter: /.*/, namespace: 'route-definition' }, async () => {
    const files = await filesPromise;
    const getImport = type === 'client' ? (p) => `${p}?client` : (p) => p;

    const getChildRoutes = (f) => {
      const children = files.filter((c) => c.parent === f.path);
      if (!children.length) {
        return '';
      }
      /* eslint-disable no-use-before-define */
      return `
  children: [${children.map((c) => getRoute(c))}],`;
      /* eslint-enable no-use-before-define */
    };

    const getRoute = (f) => `
{
  id: '${f.path}',
  path: '${getPathFromFileName(f.path)}',
  component: async () => {
    const cmp = (await import('./${getImport(f.path)}')).default;
    return {
      name: 'RouteWrapper',
      render: () => h(VuemixRoute, { id: '${f.path}' }, () => h(cmp)),
    };
  },${getChildRoutes(f)}
}`;

    const contents = `
import { h } from 'vue';

import { VuemixRoute } from '../../vuemix/index.mjs';

export default [${files
      .filter((f) => !f.parent)
      .map(getRoute)
      .join(',')}];
`;
    return {
      resolveDir: routeDir,
      contents,
      loader: 'js',
    };
  });
}

// Define a virtual module to be used by client-side route imports so that we
// can tree-shake laoders/actions from client side bundles.
function defineClientRouteVirtualModule(build) {
  build.onResolve({ filter: /\.vue\?client$/ }, async (args) => ({
    path: args.path,
    namespace: 'route-client-stub',
  }));
  build.onLoad(
    { filter: /.*/, namespace: 'route-client-stub' },
    async (args) => {
      const contents = `
import component from '${args.path.replace('?client', '')}';
export default component;
`;
      return {
        resolveDir: routeDir,
        contents,
        loader: 'js',
      };
    },
  );
}

export default function vuemixPlugin({ type }) {
  return {
    name: 'route-definition',
    setup(build) {
      const filesPromise = readRoutesDirectory();
      defineServerRouteManifestVirtualModule(build, filesPromise);
      defineRouteDefinitionVirtualModule(build, filesPromise, type);
      defineClientRouteVirtualModule(build, filesPromise);
    },
  };
}
