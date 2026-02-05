// @ts-check
import { defineConfig } from 'astro/config';

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  // to run locally comment out adapter line -- I was getting tslib errors with it
  adapter: netlify(),
});
