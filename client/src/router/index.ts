import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: () => {
        const auth = useAuthStore()
        if (auth.stage >= 2) return '/dashboard'
        if (auth.stage >= 1) return '/unlock'
        return '/login'
      },
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginStage1.vue'),
    },
    {
      path: '/unlock',
      name: 'Unlock',
      component: () => import('../views/LoginStage2.vue'),
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../views/Dashboard.vue'),
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (auth.loading) {
    await auth.checkSession()
  }

  if (to.path.startsWith('/api')) return true

  if (to.path === '/login' && auth.stage >= 1) return '/unlock'
  if (to.path === '/login' && auth.stage >= 2) return '/dashboard'

  if (to.path === '/unlock' && auth.stage < 1) return '/login'
  if (to.path === '/unlock' && auth.stage >= 2) return '/dashboard'

  if (to.path === '/dashboard' && auth.stage < 1) return '/login'
  if (to.path === '/dashboard' && auth.stage < 2) return '/unlock'

  return true
})

export default router
