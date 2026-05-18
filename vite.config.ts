import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  // Safely check for the environment variable during the Vite build phase
  const isHmrDisabled = env.DISABLE_HMR === 'true';

  return {
    plugins: [react(), tailwindcss()],
    base: './',
    define: {
      'process.env': {},
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
      'process.env.DISABLE_HMR': JSON.stringify(env.DISABLE_HMR || 'false'),
    },
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      // Replaced the runtime 'process.env' references with the safe build-time variable
      hmr: !isHmrDisabled,
      watch: isHmrDisabled ? null : {},
    },
  };
});
