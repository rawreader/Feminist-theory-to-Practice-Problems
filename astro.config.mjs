import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// Two modes:
// - Local (default): server output with the Node adapter, so the admin
//   page and its API routes work and data edits appear live.
// - Static (DEPLOY_TARGET=static): a fully static build for GitHub Pages.
//   The catalog is baked into catalog.json and matching runs in the browser.
const isStatic = process.env.DEPLOY_TARGET === 'static';
const rawBase = process.env.BASE_PATH || '/';
const base = rawBase.endsWith('/') ? rawBase : rawBase + '/';

export default defineConfig(
  isStatic
    ? {
        output: 'static',
        site: process.env.SITE_URL || 'https://example.github.io',
        base,
      }
    : {
        output: 'server',
        adapter: node({ mode: 'standalone' }),
      }
);
