/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'
import { setupLayouts } from 'virtual:generated-layouts'
import bill from '@/pages/bill.vue'
const routes = [
  {
    path: '/bill/:congress/:billType/:billNumber',
    name: 'bill',
    component: bill,
    props: true
  }
];
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  extendRoutes: (autoRoutes) => {
    const extendedRoutes = setupLayouts(autoRoutes);
    const routesRoutes = setupLayouts(routes);
    return [
      ...extendedRoutes,
      ...routesRoutes
    ];
  },
})

export default router
