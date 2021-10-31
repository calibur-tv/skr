import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import host from 'vite-plugin-host'
import components from 'unplugin-vue-components/vite'

const plugins = [
  vue(),
  host(),
  components({
    dirs: 'frontend/components'
  })
]

export default defineConfig({
  root: './frontend',
  plugins,
  server: {
    port: parseInt(process.env.PORT || '3000'),
    open: true
  }
})
