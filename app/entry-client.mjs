import { createApp } from 'vue';
import { createWebHistory } from 'vue-router';

import createVuemixApp from './create-app.mjs';

const { app, router } = createVuemixApp(createApp, createWebHistory());

app.mount('#app');
