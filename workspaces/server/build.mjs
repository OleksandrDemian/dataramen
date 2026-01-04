import * as esbuild from 'esbuild';
import fs from 'node:fs';
import { join, posix, basename } from 'node:path';
import fg from 'fast-glob';
import {spawn} from "node:child_process";

const [mode] = process.argv.slice(2);

if (mode === "watch") {
  await watch();
} else if (mode === "build") {
  await build();
} else {
  console.warn("Unknown command: " + mode);
}

async function watch () {
  /**
   * @type {ChildProcess}
   */
  let serverProcess;
  const buildOptions = getOptions();

  const context = await esbuild.context({
    ...buildOptions,
    plugins: [
      ...buildOptions.plugins,
      {
        name: 'rerun-server-plugin',
        setup(build) {
          let buildCounter = 0;
          build.onEnd(() => {
            console.log(`\n\n\n`);
            if (serverProcess) {
              console.log(`Kill old process with pid: ${serverProcess.pid}`);
              serverProcess.kill();
            }

            console.log(`<<<${buildCounter > 0 ? 'Restarting' : 'Starting'} server after build>>>\n\n\n`);
            buildCounter++;
            serverProcess = spawn("node", ["dist/server.js", "local", ".env"], { stdio: "inherit" });
          });
        },
      }
    ],
  });
  await context.watch();
}

async function build () {
  return esbuild.build(getOptions());
}

/**
 * @returns {esbuild.BuildOptions}
 */
function getOptions () {
  const INCLUDE = ["@dataramen/sql-builder", "@dataramen/common"];
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  const external = Object.keys(packageJson.dependencies).filter((pkg) => {
    return !INCLUDE.includes(pkg);
  });

  console.log("Bundled", INCLUDE);
  console.log("External", external);

  /**
   * @type {esbuild.BuildOptions}
   */
  return {
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
    plugins: [],
  };
}
