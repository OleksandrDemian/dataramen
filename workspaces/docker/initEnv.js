const crypto = require("node:crypto");
const fs = require("node:fs");

const [targetPath] = process.argv.slice(2);

const SYMM_ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');
const JWT_SECRET = crypto.randomBytes(32).toString('hex');
const JWT_REFRESH_SECRET = crypto.randomBytes(32).toString('hex');

fs.writeFileSync(targetPath, [
  `SYMM_ENCRYPTION_KEY=${SYMM_ENCRYPTION_KEY}`,
  `JWT_SECRET=${JWT_SECRET}`,
  `JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}`,
].join("\n"), "utf8");
