import App from "../app/App.vue";
import NavView from "../views/NavView.vue";
import { createRouter, createWebHistory } from "vue-router";

// Lazy load
const ViewTransition1 = () =>
  import("../views/view-transition/ViewTransitionPage1.vue");
const ViewTransition2 = () =>
  import("../views/view-transition/ViewTransitionPage2.vue");

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: NavView,
    },
    {
      path: "/view-transition1",
      component: ViewTransition1,
    },
    {
      path: "/view-transition2",
      component: ViewTransition2,
    },
    {
      path: "/:any(.*)",
      redirect() {
        return "/";
      },
    },
  ],
});

export default router;
