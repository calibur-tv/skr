import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import host from 'vite-plugin-host'
import strip from '@rollup/plugin-strip'
import components from 'vite-plugin-components'
import styleImport from 'vite-plugin-style-import'

const isProd = process.env.NODE_ENV === 'production'

const plugins = [
  vue(),
  host(),
  components(),
  styleImport({
    libs: []
  })
]

if (isProd) {
  plugins.push(strip())
}

export default defineConfig({
  root: './frontend',
  plugins,
  server: {
    port: parseInt(process.env.PORT || '3000')
  }
})
