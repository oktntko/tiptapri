import App from './App.vue';
import './plugin/log';
import router from './middleware/router';
import './styles.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
