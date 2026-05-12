import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import AddMotView from '../views/AddMotView.vue'
import EditMotView from '../views/EditMotView.vue'
import CodeView from '../views/CodeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: () => {
        const token = localStorage.getItem('auth_token')
        return token ? '/home' : '/login'
      }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView
    },
    {
      path: '/add',
      name: 'add',
      component: AddMotView
    },
    {
      path: '/login/code',
      name: 'code',
      component: CodeView
    },
    {
      path: '/edit/:id',
      name: 'edit',
      component: EditMotView,
      props: true
    }
  ]
})

export default router