<template>
  <h1>Welcome to Vuemix!</h1>
  <p>
    Vuemix is a <i>super</i> simple POC of a
    <a href="https://remix.run" target="_blank">Remix</a> approach using Vue.
    It's got a tiny fraction of the features but aims to proof out the main
    flows of loaders, actions, nested-routes, transitions, and progressive
    enhancement.
  </p>

  <p>A few features that are not yet supported:</p>
  <ul>
    <li>Parameterized routes</li>
    <li>Error/Catch boundaries</li>
    <li>useFetcher</li>
    <li>
      "Smart" JS loading and/or prefetching. Route-level code-splitting is
      included, but it does a waterfall import from entry-client on initial
      load.
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
  <button data-testid="increment-button" @click="count++">
    Increment {{ count }}
  </button>

  <h2>Actions</h2>
  <p>
    It supports form submissions (with and without JS) using actions. In this
    case our server-side action will append a random number to your input:
  </p>
  <VuemixForm method="post">
    <input name="text" data-testid="text-input" />
    <button type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? 'Submitting...' : 'Submit' }}
    </button>
    <br />
    Submitted text: {{ submittedText }}
  </VuemixForm>

  <h2>Nested Routes</h2>
  <p>
    Be sure to check out the
    <router-link to="/todos">Todos</router-link> section for an example of
    nested routes!
  </p>
</template>

<script>
import { computed, ref } from 'vue';

import {
  useActionData,
  useLoaderData,
  useTransition,
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
    const loaderData = useLoaderData();
    const actionData = useActionData();
    const transition = useTransition();
    const count = ref(loaderData.value?.count);
    const isSubmitting = computed(() => transition.value.submission != null);
    const submittedText = computed(() => actionData.value?.text);

    return {
      count,
      isSubmitting,
      submittedText,
      transition,
    };
  },
};
</script>
