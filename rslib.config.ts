import { defineConfig } from '@rslib/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: 'es2022',
      dts: {
        bundle: true,
      },
      bundle: true,
      source: {
        entry: {
          index: './src/index.ts',
        },
      },
      output: {
        target: 'node',
        copy: [{ from: './runtime/typst.css', to: 'runtime/typst.css' }],
        externals: [
          '@myriaddreamin/typst-ts-node-compiler',
          'fast-glob',
          '@rspress/core',
        ],
      },
    },
    {
      format: 'esm',
      syntax: 'es2022',
      dts: false,
      bundle: true,
      source: {
        entry: {
          loader: './src/loader.ts',
        },
      },
      output: {
        target: 'node',
        externals: [
          '@myriaddreamin/typst-ts-node-compiler',
          'fast-glob',
        ],
      },
    },
    {
      format: 'esm',
      syntax: 'es2022',
      dts: {
        bundle: true,
      },
      bundle: true,
      plugins: [pluginReact()],
      source: {
        entry: {
          'runtime/index': './runtime/index.tsx',
        },
      },
      output: {
        target: 'web',
        externals: [
          'react',
          'react/jsx-runtime',
          'react/jsx-dev-runtime',
        ],
      },
    },
  ],
});
