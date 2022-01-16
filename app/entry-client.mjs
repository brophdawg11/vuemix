import { createApp } from 'vue';
import { createWebHistory } from 'vue-router';

import createVuemixApp from './create-app.mjs';

const { app, router } = createVuemixApp(createApp, createWebHistory(), {
  loaderData: window.__vuemix.loaderData,
});

window.__vuemix.app = app;
window.__vuemix.router = router;

router.isReady().then(() => app.mount('#app'));
