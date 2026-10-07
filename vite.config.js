import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

// Environment variables the app can read, including the VUE_APP_ ones the builds already set
const envPrefix = ['VITE_', 'VUE_APP_']

export default defineConfig(({ command, mode }) => {
  // Production builds must be given the backend URL
  const env = loadEnv(mode, process.cwd(), envPrefix)
  if (command === 'build' && !env.VUE_APP_WEBSOCKET_URL) {
    throw new Error('VUE_APP_WEBSOCKET_URL must be set, e.g. wss://aochat-api.jkbff.com/connect')
  }

  return {
    plugins: [vue(), vuetify()],
    envPrefix,
    define: {
      'import.meta.env.VUE_APP_BUILD_TIME': JSON.stringify(new Date().toISOString())
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    build: {
      rolldownOptions: {
        output: {
          // Libraries in their own chunk, so browsers keep them cached across app releases
          codeSplitting: {
            groups: [{ name: 'vendors', test: /[\\/]node_modules[\\/]/ }]
          }
        }
      }
    },
    test: {
      environment: 'jsdom',
      include: ['tests/unit/**/*.spec.js'],
      // Vuetify imports its own CSS, which only Vite can load
      server: {
        deps: {
          inline: ['vuetify']
        }
      }
    }
  }
})
