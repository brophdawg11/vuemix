<template>
  <h1>New Todo</h1>
  <VuemixForm method="post">
    <label>
      Todo:
      <input name="todo" />
    </label>
    <button type="submit">Add</button>
  </VuemixForm>
  <router-link to="/todos">Cancel</router-link>
</template>

<script>
import { redirect } from '../../../vuemix/response.mjs';
import { VuemixForm } from '../../../vuemix/index.mjs';
import { addTodo } from '../../todos.mjs';

export function action({ formData }) {
  const { todo } = formData;
  addTodo(todo);
  throw redirect('/todos');
}

export default {
  name: 'NewTodoView',
  components: {
    VuemixForm,
  },
};
</script>
