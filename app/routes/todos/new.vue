<template>
  <div class="todos-new">
    <h3>Add a Todo</h3>
    <VuemixForm method="post">
      <input name="todo" />
      <button type="submit">Add</button>
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
