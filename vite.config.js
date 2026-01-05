import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { copyFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Plugin to copy license files to dist-widget
function copyLicenseFiles() {
  return {
    name: 'copy-license-files',
    writeBundle() {
      // Copy LICENSE file
      if (existsSync('LICENSE')) {
        copyFileSync('LICENSE', 'dist-widget/LICENSE');
      }
      // Copy THIRD_PARTY_LICENSES.md file
      if (existsSync('THIRD_PARTY_LICENSES.md')) {
        copyFileSync('THIRD_PARTY_LICENSES.md', 'dist-widget/THIRD_PARTY_LICENSES.md');
      }
    }
  };
}

// Widget/Standalone App build configuration for Options 1 & 2
export default defineConfig({
  plugins: [svelte(), copyLicenseFiles()],
  build: {
    outDir: 'dist-widget',
    rollupOptions: {
      input: {
        widget: 'index.html',
      },
      output: {
        // Generate files suitable for CDN distribution
        entryFileNames: 'chat-bubble.js',
        chunkFileNames: 'chat-bubble-[hash].js',
        assetFileNames: (assetInfo) => {
          // Keep icons in their original structure
          if (assetInfo.name && assetInfo.name.includes('favicon')) {
            return 'icons/[name].[ext]';
          }
          return 'chat-bubble.[ext]';
        },
      },
    },
    // Copy static assets
    copyPublicDir: false,
    assetsDir: '',
  },
  define: {
    // Allow runtime environment variable override
    'process.env': {},
  },
  // Define public directory for assets
  publicDir: false,
  // Set the base path for proper asset resolution in deployed environments
  base: './',
});
