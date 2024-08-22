import { promises as fs } from 'node:fs';

//
//

/** @type {import('esbuild').Plugin} */
export const convertClassPlugin = {
  name: 'convert-class',
  setup(build) {
    build.onDispose(async () => {
      console.log('convertClassPlugin onDispose');

      const js = build.initialOptions.outfile;

      const contents = await fs.readFile(js);

      await fs.writeFile(
        js,
        contents
          .toString()
          .replace(/var\s+(\w+)\s+=\s+class\s+\{/g, 'class $1 {') // Remove os var SomeClass = class {
          .replace(/\/\*\*(\s|\*)*@internal\s*\*\/\s*/g, ''), // Remove os @internal
      );
    });
  },
};
