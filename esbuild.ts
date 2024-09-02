import * as esbuild from 'esbuild';
import { fixClassNamesPlugin } from 'esbuild-utils';

//
//  Signal fatory
//

await esbuild.build({
  entryPoints: ['./src/index.ts'],
  bundle: true,
  outdir: 'dist',
  format: 'esm',
  plugins: [fixClassNamesPlugin()],
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
