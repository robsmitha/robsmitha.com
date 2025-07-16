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
import budget from '@/pages/budget.vue'
import Transactions from '@/components/Financial/Transactions.vue'
import EditBudget from '@/components/Financial/EditBudget.vue'
import BudgetAccounts from '@/components/Financial/BudgetAccounts.vue'
import Exemptions from '@/components/Financial/Exemptions.vue'
import search from '@/pages/search.vue'
import account from '@/pages/account.vue'
import IncomeSources from '@/components/Financial/IncomeSources.vue'

import { RouteLocationNormalized } from 'vue-router';
import IncomeTransactions from '@/components/Financial/IncomeTransactions.vue'
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
  {
    path: '/budget/:budgetId',
    name: 'budget',
    component: budget,
    props: true,
    children: [
      {
        path: 'edit',
        name: 'edit',
        component: EditBudget,
        props: true,
      },
      {
        path: 'transactions',
        name: 'transactions',
        component: Transactions,
        props: true,
      },
      {
        path: 'accounts',
        name: 'accounts',
        component: BudgetAccounts,
        props: true,
      },
      {
        path: 'exemptions',
        name: 'exemptions',
        component: Exemptions,
        props: true,
      }
    ]
  },
  {
    path: '/search/:serialNumber?',
    name: 'search',
    component: search,
    props: true
  },
  {
    path: '/account/:institutionAccessItemId',
    name: 'account',
    component: account,
    props: true,
    children: [
      {
        path: 'income',
        name: 'income',
        component: IncomeSources,
        props: true,
      },
      {
        path: 'transactions/:incomeSourceId?',
        name: 'transactions',
        component: IncomeTransactions,
        props: true,
      }
    ]
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
    // always scroll to top
    return { top: 0 }
  },
})

export default router
