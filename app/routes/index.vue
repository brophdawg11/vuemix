<template>
  <h1>Hello Vuemix</h1>
  <p :style="{ color: isMounted ? 'red' : 'black' }">
    {{ isMounted ? 'Mounted!' : 'Mounting...' }}
  </p>
  <button @click="count++">Increment {{ count }}</button>
  <VuemixForm method="post">
    <label>
      Text: <input name="text" value="test" /><br />
      ActionData Text: {{ text }}<br />
    </label>
    <button type="submit">Submit</button>
  </VuemixForm>
</template>

<script>
import { computed, onMounted, ref } from 'vue';

import {
  useActionData,
  useLoaderData,
  useVuemixCtx,
  VuemixForm,
} from '../../vuemix/index.mjs';

export async function loader() {
  await new Promise((r) => {
    setTimeout(r, 200);
  });
  return {
    count: 10,
  };
}

export async function action({ formData }) {
  await new Promise((r) => {
    setTimeout(r, 200);
  });
  return {
    text: `${formData.text}-appended`,
  };
}

export default {
  name: 'IndexView',
  components: {
    VuemixForm,
  },
  setup() {
    const vuemixCtx = useVuemixCtx();
    const loaderData = useLoaderData();
    const actionData = useActionData();

    const count = ref(loaderData.value?.count);
    const text = computed(() => actionData.value?.text);

    const isMounted = ref(false);
    onMounted(() => {
      isMounted.value = true;
    });

    async function onSubmit() {
      const formData = new FormData(document.getElementsByTagName('form')[0]);
      const res = await fetch(`${window.location.pathname}?_action=xxx`, {
        method: 'post',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(formData),
      });
      const data = await res.json();
      // TODO: Move form submission to <Form>
      vuemixCtx.actionData = data;
    }

    return {
      count,
      text,
      isMounted,
      onSubmit,
    };
  },
};
</script>
