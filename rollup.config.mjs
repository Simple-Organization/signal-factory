import { dts } from 'rollup-plugin-dts';

const config = [
  // …
  {
    input: './dist/types/src/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
  {
    input: './dist/types/src/wrappers/vanilla-atom.d.ts',
    output: [{ file: 'vanilla-atom/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
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
];

export default config;
