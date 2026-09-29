import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// MOTOR_URL permite apuntar a otro motor (p. ej. uno aislado con base temporal para pruebas)
const api = { '/api': { target: process.env.MOTOR_URL ?? 'http://127.0.0.1:3456', changeOrigin: true } };

export default defineConfig({
  plugins: [react()],
  server: { port: 5174, proxy: api },
  preview: { port: 5174, proxy: api },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 2500,
    // Three.js y React cambian poco: en su propio bloque, una actualización del juego no invalida su caché
    rolldownOptions: {
      output: {
        advancedChunks: {
          groups: [
            { name: 'three', test: /node_modules[\/]three[\/]/ },
            { name: 'react', test: /node_modules[\/](react|react-dom|scheduler|zustand)[\/]/ }
          ]
        }
      }
    }
  }
});
