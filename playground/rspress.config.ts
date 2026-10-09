import path from 'node:path';
import { defineConfig } from '@rspress/core';
import { pluginTypst } from 'rspress-plugin-typst';

const repo = 'rspress-plugin-typst';
const siteOrigin = 'https://glimverge.github.io';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'rspress-plugin-typst',
  description:
    'Use Typst .typ files as Rspress documentation pages via experimental HTML export.',
  // Project site: https://glimverge.github.io/rspress-plugin-typst/
  base: `/${repo}/`,
  siteOrigin,
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/glimverge/rspress-plugin-typst',
      },
    ],
    nav: [
      {
        text: 'Guide',
        link: '/guide/getting-started',
      },
      {
        text: 'Examples',
        link: '/guide/hello',
      },
      {
        text: 'GitHub',
        link: 'https://github.com/glimverge/rspress-plugin-typst',
      },
    ],
    sidebar: {
      '/': [
        {
          text: 'Guide',
          items: [
            { text: 'Introduction', link: '/' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Options', link: '/guide/options' },
          ],
        },
        {
          text: 'Examples',
          items: [
            { text: 'Hello Typst', link: '/guide/hello' },
            { text: 'Math & Code', link: '/guide/math' },
          ],
        },
      ],
    },
  },
  plugins: [
    pluginTypst({
      inputs: {
        site: 'rspress-plugin-typst',
      },
    }),
  ],
});
