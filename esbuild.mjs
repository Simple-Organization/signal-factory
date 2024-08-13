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
