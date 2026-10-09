import path from 'node:path';
import { defineConfig } from '@rspress/core';
import { pluginTypst } from 'rspress-plugin-typst';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'Rspress + Typst',
  description: 'Demo site for rspress-plugin-typst',
  themeConfig: {
    nav: [
      {
        text: 'Guide',
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
          text: 'Introduction',
          items: [
            { text: 'Overview', link: '/' },
            { text: 'Hello Typst', link: '/guide/hello' },
            { text: 'Math & Code', link: '/guide/math' },
          ],
        },
      ],
    },
  },
  plugins: [
    pluginTypst({
      // Typst experimental HTML export powered by Rust (typst-ts-node-compiler).
      inputs: {
        site: 'Rspress + Typst',
      },
    }),
  ],
});
