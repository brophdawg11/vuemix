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
          const contents = `
export default [
  ${files.map(
    (f) => `{
    path: '${getPathFromFileName(f)}',
    component: async () => (await import('./${f}?${type}')).default,
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
