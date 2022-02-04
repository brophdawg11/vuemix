import { computed, h, inject, provide, ref } from 'vue';
import { useRouter } from 'vue-router';

export function useVuemixCtx() {
  return inject('vuemixCtx');
}

export function useActionData() {
  return inject('actionData');
}

export function useLoaderData() {
  return inject('loaderData');
}

export function useTransition() {
  return inject('transition');
}

// Append the given queryParams to the url.  Params can be an object of FormData
function appendQueryParams(url, params) {
  const qs = new URLSearchParams(params);
  const sep = url.indexOf('?') >= 0 ? '&' : '?';
  return `${url}${sep}${qs}`;
}

// Prefer leaf routes over layout routes in dup path scenarios
export function getLeafRoute(routeManifest, route) {
  const path = typeof route === 'string' ? route : route.path;
  const routeManifestArray = Object.values(routeManifest);
  return (
    routeManifestArray.find((r) => r.path === path && !r.layout) ||
    routeManifestArray.find((r) => r.path === path)
  );
}

// Return an array of the route hierarchy, ending with the provided route
export function getAncestorRoutes(routeManifest, route) {
  if (!route.parent) {
    return [route];
  }
  const parent = routeManifest[route.parent];
  return [route, ...getAncestorRoutes(routeManifest, parent)];
}

// Fetch load data for the given route manifest entries
export async function fetchLoaderData(url, routeOrRoutes) {
  const routes = Array.isArray(routeOrRoutes) ? routeOrRoutes : [routeOrRoutes];
  const fullUrl = appendQueryParams(url, {
    _data: routes.map((r) => r.id).join(','),
  });
  const res = await fetch(fullUrl);
  const loaderData = await res.json();
  return loaderData;
}

export const VuemixRoute = {
  name: 'VuemixRoute',
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup(props, { slots }) {
    const vuemixCtx = inject('vuemixCtx');
    provide(
      'actionData',
      computed(() => vuemixCtx.actionData),
    );
    provide(
      'loaderData',
      computed(() => vuemixCtx.loaderData[props.id]),
    );
    return () => h(slots.default()[0]);
  },
};

export const VuemixForm = {
  name: 'VuemixForm',
  props: {
    reloadDocument: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { attrs, slots }) {
    const vuemixCtx = useVuemixCtx();
    const router = useRouter();
    const el = ref();

    const onSubmit = async (e) => {
      e.preventDefault();

      const method = (attrs.method || 'post').toLowerCase();
      const url = attrs.action || window.location.pathname;
      const activeRoute = getLeafRoute(vuemixCtx.routeManifest, url);
      const formData = new FormData(el.value);

      if (
        e?.submitter.tagName.toLowerCase() === 'button' &&
        e.submitter.name &&
        e.submitter.value
      ) {
        formData.append(e.submitter.name, e.submitter.value);
      }

      if (method === 'get') {
        vuemixCtx.transition = {
          state: 'submitting',
          type: 'loaderSubmission',
          submission: formData,
          location: url,
        };
        const fullUrl = appendQueryParams(url, formData);
        router.push(fullUrl);
        return;
      }

      if (method !== 'post') {
        throw new Error('Non-get/post methods are not supported by VuemixForm');
      }

      vuemixCtx.transition = {
        state: 'submitting',
        type: 'actionSubmission',
        submission: formData,
        location: url,
      };
      const qs = new URLSearchParams({
        _action: activeRoute.id,
      });
      const res = await fetch(`${url}?${qs}`, {
        method,
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(formData),
      });

      const { headers } = res;
      if (headers.get('x-vuemix-redirect')) {
        Object.assign(vuemixCtx.transition, {
          state: 'loading',
          type: 'actionRedirect',
        });
        router.push({
          // TODO doesn't yet handle redirecting with query params
          path: headers.get('x-vuemix-location'),
          // Use force in case we submitted to ourselves and need to force a reload
          force: true,
        });
        return;
      }

      const actionData = await res.json();

      if (res.status >= 200 && res.status <= 299) {
        Object.assign(vuemixCtx.transition, {
          state: 'loading',
          type: 'actionReload',
        });
        const loaderData = await fetchLoaderData(url, activeRoute);
        Object.assign(vuemixCtx.loaderData, loaderData);
      }
      vuemixCtx.actionData = actionData;
      vuemixCtx.transition = { state: 'idle' };
    };

    const formProps = {
      ref: el,
      ...attrs,
      ...(!props.reloadDocument ? { onSubmit } : {}),
    };
    return () => h('form', formProps, slots.default());
  },
};
