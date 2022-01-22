<template>
  <div class="todos-new">
    <h3>Add a Todo</h3>
    <VuemixForm method="post">
      <input name="todo" />
      <button type="submit" :disabled="isAdding">
        {{ isAdding ? 'Adding...' : 'Add' }}
      </button>
    </VuemixForm>
    <router-link to="/todos">Cancel</router-link>
    <p>
      <br />
      Note that this form redirects back to the updated todo list on submissison
      - without or without JS enabled!
    </p>
  </div>
</template>

<script>
import { computed } from 'vue';

import { redirect } from '../../../vuemix/response.mjs';
import { VuemixForm, useTransition } from '../../../vuemix/index.mjs';
import { addTodo } from '../../todos.mjs';

export async function action({ formData }) {
  const { todo } = formData;
  addTodo(todo);
  await new Promise((r) => {
    setTimeout(r, 100);
  });
  throw redirect('/todos');
}

export default {
  name: 'NewTodoView',
  components: {
    VuemixForm,
  },
  setup() {
    const transition = useTransition();
    return {
      isAdding: computed(() => transition.value?.submission != null),
    };
  },
};
</script>
