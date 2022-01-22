# Vuemix

Vuemix is a _super_ simple POC of a [Remix](https://remix.run) approach using Vue. It's got a tiny fraction of the features but aims to prove out the main flows of loaders, actions, nested-routes, transitions, and progressive enhancement.

A few notable features that are not yet supported:

- Parameterized routes
- Error/Catch boundaries
- `useFetcher`
- "Smart" JS loading and/or prefetching
  - Route-level code-splitting is included, but it does a waterfall import from entry-client on initial load
- Edge-native hotness - Vuemix is tightly-coupled to Express
- `link`/`meta` tag handling or the ability to control the full `<html>` document via Vue
- Plenty of other awesome features that Remix proivides

## Usage

```bash
> npm ci
> npm run build
> npm run start
```

This will build the server/client apps with [`esbuild`](https://esbuild.github.io/) and launch an [`express`](https://expressjs.com/) server at http://localhost:8080 which demonstrates a few routes and loaders/actions.

#### Local Development

```bash
> npm ci
> npm run dev

# Second Tab
> npm run dev:serve
```
