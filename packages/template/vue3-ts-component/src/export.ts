import <%= name.pascalCase %> from './components/index.vue'
import { App } from 'vue'

export default (app: App) => {
  app.component('<%= name.paramCase %>', <%= name.pascalCase %>)
}