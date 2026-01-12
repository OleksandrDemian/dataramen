import { execSync } from "node:child_process";
import { fileURLToPath } from 'url';
import { join, dirname } from "node:path";
import fs from "fs-extra";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * @type {"cli" | "app" | "docker"}
 */
const target = process.argv[2] || "app";

const serverPath = join(__dirname, "workspaces", "server");
const dockerPath = join(__dirname, "workspaces", "docker");
const webPath = join(__dirname, "workspaces", "web");
const cliPath = join(__dirname, "workspaces", "cli");
const distPath = target === "cli" ? join(__dirname, "workspaces", "cli", "dist") : join(__dirname, "dist");

preparePackage().then(() => {
  if (target === "cli") {
    console.log("CLI ready for distribution");
  } else {
    console.log("Self-hosted app ready for distribution");
  }
});

async function preparePackage() {
  removeDist();
  typecheckServer();

  if (target === "cli") {
    buildCli();
  }

  buildServer();
  buildWeb();
  copyResources();
  handleDependencies();
}

function typecheckServer () {
  execSync(`yarn typecheck`, {
    stdio: "inherit",
    cwd: serverPath,
  });

  console.log("Server types check done");
}

function buildCli () {
  execSync(`yarn build`, {
    stdio: "inherit",
    cwd: cliPath,
  });

  console.log("CLI package build done");
}

function buildServer () {
  execSync(`yarn build`, {
    stdio: "inherit",
    cwd: serverPath,
  });

  console.log("Server package build done");
}

function buildWeb () {
  execSync(`yarn build`, {
    stdio: "inherit",
    cwd: webPath,
  });

  console.log("Web package build done");
}

function removeDist () {
  if (fs.pathExistsSync(distPath)) {
    fs.removeSync(distPath);
  }
}

function copyResources () {
  fs.copySync(join(serverPath, "dist"), join(distPath, "code"));
  fs.copySync(join(serverPath, "package.json"), join(distPath, "package.json"));
  fs.copySync(join(webPath, "dist"), join(distPath, "code", "web"));

  if (target === "cli") {
    fs.copySync(join(cliPath, "bin", "app.js"), join(distPath, "code", "cli.js"));
    fs.copySync(join(cliPath, "README.md"), join(distPath, "README.md"));
  }

  if (target === "docker") {
    fs.copySync(join(dockerPath, "initEnv.js"), join(distPath, "initEnv.js"));
  }

  console.log("Resources copied");
}

function handleDependencies () {
  const packageJson = fs.readJsonSync(join(distPath, "package.json"));
  const cliPackageJson = fs.readJsonSync(join(cliPath, "package.json"));
  const deleteProperties = ["devDependencies", "files", "bin", "scripts"];

  for (const prop of deleteProperties) {
    console.log("Remove " + prop);
    delete packageJson[prop];
  }

  console.log("Cleanup package.json", deleteProperties);

  // rewire entry point
  packageJson.main = "code/server.js";

  if (target === "cli") {
    // in case of CLI build, build CLI deps as dev deps
    packageJson.devDependencies = cliPackageJson.dependencies;
    console.log("Added cli dependencies as devDependencies");
  }

  fs.writeJsonSync(join(distPath, "package.json"), packageJson);
}
