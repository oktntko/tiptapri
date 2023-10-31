import App from './App.vue';
import router from './middleware/router';
import './styles.css';
import './tauri-plugin/log';
import './tauri-plugin/store';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
