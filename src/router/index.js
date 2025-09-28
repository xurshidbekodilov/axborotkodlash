import { createRouter, createWebHistory } from "vue-router";
import ShenonFano from "../pages/shenonFano.vue";
import Xaffman from "../pages/xaffman.vue";

const routes = [
    {
        path: "/",
        name: "ShennonFano",
        component: ShenonFano,
    },
    {
        path: "/xaffman",
        name: "Xaffman",
        component: Xaffman,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
