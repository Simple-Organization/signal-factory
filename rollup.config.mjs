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
  //  Store
  //

  {
    input: './dist/types/src/stores/index.d.ts',
    output: [{ file: 'store/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },

  //
  //  Wrappers
  //

  {
    input: './dist/types/src/wrappers/vue.d.ts',
    output: [{ file: 'vue/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
  {
    input: './dist/types/src/wrappers/solid.d.ts',
    output: [{ file: 'solid/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
  {
    input: './dist/types/src/wrappers/angular.d.ts',
    output: [{ file: 'angular/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
  {
    input: './dist/types/src/wrappers/testing.d.ts',
    output: [{ file: 'testing/index.d.ts', format: 'es' }],
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
