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

    const onSubmit = async (e) => {
      e.preventDefault();

      const formData = new FormData(document.getElementsByTagName('form')[0]);
      const url = attrs.action || window.location.pathname;
      const res = await fetch(`${url}?_action`, {
        method: 'post',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(formData),
      });
      const data = await res.json();
      vuemixCtx.actionData = data;
    };

    const formProps = {
      ...attrs,
      ...(!props.reloadDocument ? { onSubmit } : {}),
    };
    return () => h('form', formProps, slots.default());
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
