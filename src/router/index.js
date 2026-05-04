import { createRouter, createWebHistory } from '@ionic/vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import DashboardView from '../views/DashboardView.vue'
import BookingsRouter from '../views/BookingsRouter.vue'
import MembersView from '../views/MembersView.vue'
import ReportsView from '../views/ReportsView.vue'
import PublicLayout from '../layouts/PublicLayout.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import TermsView from '../views/TermsView.vue'
import MyProfileView from '../views/MyProfileView.vue'
import { useAuthStore } from '@/stores/authStore.js'
import { useMeStore } from '@/stores/meStore.js'
import CatalogView from '@/views/CatalogView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      meta: { requiresAuth: true },
      component: MainLayout,
      children: [{ path: '', name: 'dashboard', component: DashboardView }],
    },
    {
      path: '/bookings',
      meta: { requiresAuth: true },
      component: MainLayout,
      children: [{ path: '', name: 'bookings', component: BookingsRouter }],
    },
    {
      path: '/members',
      meta: { requiresAuth: true, requiresRole: 'ADMIN' },
      component: MainLayout,
      children: [{ path: '', name: 'members', component: MembersView }],
    },
    {
      path: '/reports',
      meta: { requiresAuth: true, requiresRole: 'ADMIN' },
      component: MainLayout,
      children: [{ path: '', name: 'reports', component: ReportsView }],
    },
    {
      path: '/me',
      meta: { requiresAuth: true },
      component: MainLayout,
      children: [{ path: '', name: 'profile', component: MyProfileView }],
    },
    {
      path: '/catalog',
      meta: { requiresAuth: true, requiresRole: 'ADMIN' },
      component: MainLayout,
      children: [{ path: '', name: 'catalog', component: CatalogView }],
    },
    {
      path: '/login',
      meta: { requiresGuest: true },
      component: PublicLayout,
      children: [{ path: '', name: 'login', component: LoginView }],
    },
    {
      path: '/register',
      meta: { requiresGuest: true },
      component: PublicLayout,
      children: [{ path: '', name: 'register', component: RegisterView }],
    },
    {
      path: '/terms',
      component: PublicLayout,
      children: [{ path: '', name: 'terms', component: TermsView }],
    },
  ],
})

router.beforeEach(async (to, from) => {
  const auth = useAuthStore()
  const me = useMeStore()

  if (to.meta.requiresGuest && auth.isAuthenticated) {
    return '/'
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return '/login'
  }

  // Verificar roles
  if (to.meta.requiresRole && me.user?.role !== to.meta.requiresRole) {
    return '/'
  }

  return true
})

export default router
