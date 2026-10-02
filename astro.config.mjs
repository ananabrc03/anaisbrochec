import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
export default defineConfig({site: process.env.PUBLIC_SITE_URL || 'http://localhost:4321',output:'static',trailingSlash:'never',devToolbar:{enabled:false},build:{format:'directory'},integrations:[sitemap({filter: page => !page.includes('/admin') && !page.includes('/404')})],prefetch:{prefetchAll:true,defaultStrategy:'hover'}});
