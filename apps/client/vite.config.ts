import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/modules': path.resolve(__dirname, './src/modules'),
      '@/contexts': path.resolve(__dirname, './src/contexts'),
      '@/hoc': path.resolve(__dirname, './src/hoc'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@halaqa/shared': path.resolve(__dirname, '../../packages/shared/src')
    }
  },
  build: {
    target: 'esnext',
    outDir: 'build'
  },
  server: {
    port: 3000,
    open: true
  }
});
