import { createApp } from 'vue';
import { createWebHistory } from 'vue-router';

import createVuemixApp from './create-app.mjs';

const { app, router } = createVuemixApp(createApp, createWebHistory());

window.__vuemix.app = app;
window.__vuemix.router = router;

app.mount('#app');
