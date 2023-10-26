import Vue from '@vitejs/plugin-vue';
import VueJsx from '@vitejs/plugin-vue-jsx';
import AutoImport from 'unplugin-auto-import/vite';
import Unfonts from 'unplugin-fonts/vite';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';
import Pages from 'vite-plugin-pages';

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    Vue({
      script: {
        defineModel: true,
      },
    }),
    VueJsx(),
    Pages({
      exclude: ['**/components/*.vue'],
    }),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      dirs: ['src/components'],
      dts: 'src/components.d.ts',
      resolvers: [
        {
          type: 'component',
          resolve: (name) => {
            if (name === 'Icon') return { name, from: '@iconify/vue' };
          },
        },
      ],
    }),
    Unfonts({
      // https://fonts.google.com/
      google: {
        families: ['Noto Sans JP', 'Roboto'],
      },
    }),
  ],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
  },
  // 3. to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.app/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ['VITE_', 'TAURI_'],
}));
