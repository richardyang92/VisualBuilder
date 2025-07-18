import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'

// 移除 Monaco Editor 的全局配置，让组件内部处理

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')
