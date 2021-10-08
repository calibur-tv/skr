import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import host from 'vite-plugin-host'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: './src/export.ts',
      name: '<%= name.pascalCase %>'
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  },
  server: {
    port: parseInt(process.env.port || '3000'),
    open: true
  },
  plugins: [vue(), host()]
})
