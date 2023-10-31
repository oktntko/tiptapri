import App from './App.vue';
import router from './middleware/router';
import './styles.css';
import LogPlugin from './tauri-plugin/LogPlugin';
import './tauri-plugin/store';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(LogPlugin);

app.mount('#app');
