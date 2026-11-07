/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'
import { setupLayouts } from 'virtual:generated-layouts'
import bill from '@/pages/bill.vue'
import repo from '@/pages/repo.vue'
import search from '@/pages/search.vue'

import { RouteLocationNormalized } from 'vue-router';
const routes = [
  {
    path: '/bill/:congress/:billType/:billNumber',
    name: 'bill',
    component: bill,
    props: true
  },
  {
    path: '/repo/:name',
    name: 'repo',
    component: repo,
    props: true
  },
  // The old per-budget pages and /spending were replaced by the dashboard and monthly budget (Phase 3)
  { path: '/spending', redirect: '/dashboard' },
  { path: '/budget/:budgetId/:rest(.*)*', redirect: '/budget' },
  {
    path: '/search/:serialNumber?',
    name: 'search',
    component: search,
    props: true
  }
];
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  extendRoutes: (autoRoutes) => {
    const allRoutes = [...autoRoutes, ...routes]
    return setupLayouts(allRoutes);
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  scrollBehavior(to: RouteLocationNormalized, from: RouteLocationNormalized, savedPosition: null | { left: number, top: number }) {
    // Back/forward returns to where the reader was.
    if (savedPosition) {
      return savedPosition
    }
    // Links like /#projects scroll to that section, clearing the fixed 64px app bar.
    if (to.hash) {
      return { el: to.hash, top: 64, behavior: 'smooth' }
    }
    return { top: 0 }
  },
})

export default router
