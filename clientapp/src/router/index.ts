/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'
import { setupLayouts } from 'virtual:generated-layouts'
import bill from '@/pages/bill.vue'
import { RouteLocationNormalized } from 'vue-router';
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  scrollBehavior(to: RouteLocationNormalized, from: RouteLocationNormalized, savedPosition: null | { left: number, top: number }) {
    // always scroll to top
    return { top: 0 }
  },
})

export default router
