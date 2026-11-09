import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(() => ({
	base: '/',
	plugins: [react()],
	resolve: {
		alias: [
			{ find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
			{
				find: /^@lobehub\/ui(\/.*)?$/,
				replacement: fileURLToPath(new URL('./src/lobehubUiShim.tsx', import.meta.url))
			},
			{
				find: 'lucide-react',
				replacement: fileURLToPath(new URL('./src/solarLucideShim.tsx', import.meta.url))
			},
			{
				find: 'monaco-editor/esm/vs/editor/editor.worker.js',
				replacement: 'monaco-editor/editor/editor.worker.js'
			},
			{
				find: 'path-browserify',
				replacement: fileURLToPath(new URL('./src/pathBrowserifyEsm.ts', import.meta.url))
			}
		]
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
