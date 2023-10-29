import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import { createApp } from "vue";

import App from "./app/App.vue";
import router from "./router";
import "./styles.scss";

const app = createApp(App);

app.use(router);
app.use(ElementPlus);
app.mount("#root");
