import { createApp } from 'vue'
import './style.css'
import { createRouter, createWebHistory } from 'vue-router' 
import App from './App.vue'


import LoginView from './components/LoginView.vue'
import AccountView from './components/AccountView.vue'

const routes = [
  { path: '/', redirect: '/login' }, // 默认重定向到登录页
  { path: '/login', component: LoginView },
  { path: '/account', component: AccountView }
]


const router = createRouter({
  history: createWebHistory(),
  routes
})

createApp(App).use(router).mount('#app')