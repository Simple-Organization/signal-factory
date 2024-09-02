import { dts } from 'rollup-plugin-dts';

//
//

const config = [
  //
  //  Signal fatory
  //

  {
    input: './dist/types/src/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },

  //
  //  Hooks
  //

  {
    input: './dist/types/src/hooks/preact.d.ts',
    output: [{ file: 'preact/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
];

export default config;
