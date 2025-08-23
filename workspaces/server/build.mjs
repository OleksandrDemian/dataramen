import * as esbuild from 'esbuild';
import fs from 'node:fs';
import { join, posix, basename } from 'node:path';
import fg from 'fast-glob';

const INCLUDE = ["@dataramen/sql-builder", "@dataramen/common"];
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const external = Object.keys(packageJson.dependencies).filter((pkg) => {
  return !INCLUDE.includes(pkg);
});

console.log("Bundled", INCLUDE);
console.log("External", external);

await esbuild.build({
  entryPoints: [
    {
      in: join('src', "index.ts"),
      out: 'server',
    },
    ...fg.sync(posix.join('migrations', '*.ts')).map((path) => ({
      in: path,
      out: join('migrations', basename(path, '.ts')), // remove suffix
    })),
  ],
  outdir: join("dist"),
  bundle: true,
  platform: 'node',
  minify: true,
  external,
});
