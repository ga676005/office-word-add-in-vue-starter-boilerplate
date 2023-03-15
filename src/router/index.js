import { createRouter, createWebHistory, createWebHashHistory, createMemoryHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";

export const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      // component: () => import("../views/HomeView.vue"),
      component: HomeView,
    },
    {
      path: "/about",
      name: "about",
      component: () => import("../views/AboutView.vue"),
    },
  ],
});
