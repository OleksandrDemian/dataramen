import { execSync } from "node:child_process";
import { fileURLToPath } from 'url';
import { join, dirname } from "node:path";
import fs from "fs-extra";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// prepare app distribution
execSync(`yarn package:app`, {
  stdio: "inherit",
});

const resources = [
  {
    from: join(__dirname, "dist", "code", "migrations"),
    to: join(__dirname, "desktop", "migrations"),
  },
  {
    from: join(__dirname, "dist", "code", "web"),
    to: join(__dirname, "desktop", "web"),
  },
  {
    from: join(__dirname, "dist", "code", "server.js"),
    to: join(__dirname, "desktop", "server.js"),
  },
];

// copy resources
for (const { from, to } of resources) {
  if (fs.existsSync(to)) {
    // remove if already exists to prevent trash
    fs.removeSync(to);
  }

  fs.copySync(from, to);
}

// install deps
execSync(`yarn`, {
  cwd: join(__dirname, "desktop"),
  stdio: "inherit",
});

// build
execSync(`yarn make`, {
  cwd: join(__dirname, "desktop"),
  stdio: "inherit",
});
