import { h, inject, provide } from 'vue';

export const VuemixRoute = {
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup(props, { slots }) {
    const vuemixCtx = inject('vuemixCtx');
    provide('loaderData', vuemixCtx.loaderData[props.id]);
    return () => h(slots.default()[0]);
  },
};

export function useLoaderData() {
  return inject('loaderData');
}
