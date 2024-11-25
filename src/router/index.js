import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import HomePage from '../views/HomePage.vue'
import InterviewPage from '../views/InterviewPage.vue'
// import SchedulePage from '../views/SchedulePage.vue'
// import ScorePage from '../views/ScorePage.vue'

const routes = [
  { path: '/', component: LoginPage },
  { path: '/home', component: HomePage },
  { path: '/interview', component: InterviewPage },
//   { path: '/schedule', component: SchedulePage },
//   { path: '/score', component: ScorePage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router