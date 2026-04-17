import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '@previd': fileURLToPath(new URL('./src/previd', import.meta.url)),
            '@canon': fileURLToPath(new URL('./src/canon', import.meta.url))
        }
    },
    server: {
        port: 3000,
        open: true,
        proxy: {
            '/api': {
                target: 'http://localhost:4000',
                changeOrigin: true,
                secure: false
            },
            '/socket.io': {
                target: 'ws://localhost:4000',
                ws: true
            }
        }
    }
});
