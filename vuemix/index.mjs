import { computed, h, inject, provide } from 'vue';

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

export function useVuemixCtx() {
  return inject('vuemixCtx');
}

export function useActionData() {
  return inject('actionData');
}

export function useLoaderData() {
  return inject('loaderData');
}
