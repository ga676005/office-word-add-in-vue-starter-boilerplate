import './main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { pinia } from '@/stores'
import { router } from '@/router'

const app = createApp(App)
app.use(pinia)
app.use(router)

/* Render application after Office initializes */
Office.onReady(() => {
  app.mount('#app')
  console.log(window.location)
})

// if (module.hot) {
//   module.hot.accept('./App', () => {
//     const NextApp = require('./App.vue')

//     const app = createApp(NextApp)
//     app.use(pinia)
//     app.use(router)
//     app.mount('#app')
//   })
// }
