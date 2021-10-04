import <%= name.pascalCase %> from './components/index.vue'

export default (app) => {
  app.component('<%= name.paramCase %>', <%= name.pascalCase %>)
}