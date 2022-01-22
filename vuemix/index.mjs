import { computed, h, inject, provide } from 'vue';
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
  const qs = new URLSearchParams({
    _data: routes.map((r) => r.id).join(','),
  });
  const res = await fetch(`${url}?${qs}`);
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

    const onSubmit = async (e) => {
      e.preventDefault();

      const url = attrs.action || window.location.pathname;
      const activeRoute = getLeafRoute(vuemixCtx.routeManifest, url);
      const formData = new FormData(document.getElementsByTagName('form')[0]);

      vuemixCtx.transition = {
        state: 'submitting',
        type: 'actionSubmission',
        submission: formData,
        location: url,
      };
      const res = await fetch(`${url}?_action`, {
        method: 'post',
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
        await router.push(headers.get('x-vuemix-location'));
        vuemixCtx.transition = { state: 'idle' };
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
      ...attrs,
      ...(!props.reloadDocument ? { onSubmit } : {}),
    };
    return () => h('form', formProps, slots.default());
  },
};
