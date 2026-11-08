import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(() => ({
	base: '/',
	plugins: [react()],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
			'monaco-editor/esm/vs/editor/editor.worker.js': 'monaco-editor/editor/editor.worker.js',
			'path-browserify': fileURLToPath(new URL('./src/pathBrowserifyEsm.ts', import.meta.url))
		}
	},
	build: {
		emptyOutDir: true,
		reportCompressedSize: false,
		sourcemap: false,
		chunkSizeWarningLimit: 5000
	},
	server: {
		host: '0.0.0.0',
		port: 5173,
		proxy: {
			'/nvidia-nim': {
				target: 'https://integrate.api.nvidia.com',
				changeOrigin: true,
				rewrite: path => path.replace(/^\/nvidia-nim/, '')
			}
		}
	},
	preview: {
		host: '0.0.0.0',
		port: 19100
	}
}));
