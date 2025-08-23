import fs from "fs-extra";
import {join} from "node:path";
import * as esbuild from "esbuild";

const cliPackageJson = fs.readJsonSync("package.json");

await esbuild.build({
  entryPoints: ['src/run.ts'],
  bundle: true,
  outfile: join("bin", "run.js"),
  platform: 'node',
  minify: true,
  external: Object.keys(cliPackageJson.dependencies),
});
