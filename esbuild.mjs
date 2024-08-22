import * as esbuild from 'esbuild';

//
//  Signal fatory
//

await esbuild.build({
  entryPoints: ['./src/index.ts'],
  bundle: true,
  outdir: 'dist',
  format: 'esm',
  external: ['signal-factory'],
});

//
//  Store
//

await esbuild.build({
  entryPoints: ['./src/stores/index.ts'],
  bundle: true,
  outfile: 'store/index.js',
  format: 'esm',
  external: ['signal-factory'],
});

//
//  Wrappers
//

await esbuild.build({
  entryPoints: ['./src/wrappers/vue.ts'],
  bundle: true,
  outfile: 'vue/index.js',
  format: 'esm',
  external: ['vue', 'signal-factory'],
});

await esbuild.build({
  entryPoints: ['./src/wrappers/solid.ts'],
  bundle: true,
  outfile: 'solid/index.js',
  format: 'esm',
  external: ['solid-js', 'signal-factory'],
});

await esbuild.build({
  entryPoints: ['./src/wrappers/angular.ts'],
  bundle: true,
  outfile: 'angular/index.js',
  format: 'esm',
  external: ['@angular/core', 'signal-factory'],
});

await esbuild.build({
  entryPoints: ['./src/wrappers/testing.ts'],
  bundle: true,
  outfile: 'testing/index.js',
  format: 'esm',
  external: ['signal-factory'],
});

//
//  Hooks
//

await esbuild.build({
  entryPoints: ['./src/hooks/preact.ts'],
  bundle: true,
  outfile: 'preact/index.js',
  format: 'esm',
  external: ['preact/hooks', 'signal-factory'],
});

//
//  Benchmarks
//

await esbuild.build({
  entryPoints: ['./tests/benchmark.ts'],
  bundle: true,
  outfile: 'testing/benchmark.js',
  format: 'esm',
  external: ['benchmark', 'signal-factory'],
});
