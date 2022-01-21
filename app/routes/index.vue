<template>
  <h1>Welcome to Vuemix!</h1>
  <p>
    Vuemix is a <i>super</i> simple POC of a
    <a href="https://remix.run" target="_blank">Remix</a> approach using Vue.
    It's got a tiny fraction of the features but aims to proof out the main
    flows of loaders, actions, nested-routes, and progressive enhancement.
  </p>

  <p>A few features that are not yet supported:</p>
  <ul>
    <li>Parameterized routes</li>
    <li>
      "Smart" JS loading and/or prefetching. Route-level code-splitting is
      included, but it does a waterfall import from entryclint on initial load.
    </li>
    <li>Edge-native hotness - Vuemix is tightly-coupled to Express</li>
    <li>
      Link/Meta tags handling or the ability to control the full &lt;html&gt;
      document via Vue
    </li>
    <li>Plenty of other <i>awesome</i> features that Remix proivides.</li>
  </ul>

  <h2>Loaders</h2>
  <p>
    It supports loaders and hydration of the loader data to the client. In this
    case, the initial random number is returned from our server-side loader:
  </p>
  <button @click="count++">Increment {{ count }}</button>

  <h2>Actions</h2>
  <p>
    It supports form submissions (with and without JS) using actions. In this
    case our server-side action will append a random number to your input:
    <VuemixForm method="post">
      <input name="text" value="test" />
      <button type="submit">Submit</button>
      <br />
      Action Data Text: {{ text }}
    </VuemixForm>
  </p>

  <h2>Nested Routes</h2>
  <p>
    Be sure to check out the
    <router-link to="/todos">Todos</router-link> section for an example of
    nested routes!
  </p>
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
    setTimeout(r, 100);
  });
  return {
    count: Math.round(Math.random() * 100),
  };
}

export async function action({ formData }) {
  await new Promise((r) => {
    setTimeout(r, 100);
  });
  return {
    text: `${formData.text}-${Math.round(Math.random() * 100)}`,
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
