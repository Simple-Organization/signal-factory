import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['./src/index.ts'],
  bundle: true,
  outdir: 'dist',
  format: 'esm',
});

await esbuild.build({
  entryPoints: ['./src/wrappers/vanilla.ts'],
  bundle: true,
  outfile: 'vanilla/index.js',
  format: 'esm',
});

await esbuild.build({
  entryPoints: ['./src/wrappers/vue.ts'],
  bundle: true,
  outfile: 'vue/index.js',
  format: 'esm',
  external: ['vue'],
});

await esbuild.build({
  entryPoints: ['./src/wrappers/solid.ts'],
  bundle: true,
  outfile: 'solid/index.js',
  format: 'esm',
  external: ['solid-js'],
});

await esbuild.build({
  entryPoints: ['./src/wrappers/angular.ts'],
  bundle: true,
  outfile: 'angular/index.js',
  format: 'esm',
  external: ['@angular/core'],
});
