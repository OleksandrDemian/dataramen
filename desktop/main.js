const { app, BrowserWindow } = require('electron/main');
const path = require('node:path');
const fs = require("node:fs");
const { randomBytes } = require("node:crypto");

function getAppConfig() {
  try {
    const envPath = path.join(app.getPath("userData"), "env.json");
    if (fs.existsSync(envPath)) {
      return JSON.parse(fs.readFileSync(envPath, "utf8"));
    }

    const envJson = {
      dbPath: path.join(app.getPath("userData"), "db.sqlite3"),
      symmEncryptionKey: randomBytes(32).toString("hex"),
      jwtSecretKey: randomBytes(32).toString("hex"),
      jwtRefreshSecretKey: randomBytes(32).toString("hex"),
    };
    fs.writeFileSync(envPath, JSON.stringify(envJson), "utf8");

    return envJson;
  } catch (e) {
    console.error(e);
    return {};
  }
}

const config = getAppConfig();
process.env.APP_DB_DATABASE = config.dbPath;
process.env.SYMM_ENCRYPTION_KEY = config.symmEncryptionKey;
process.env.JWT_SECRET = config.jwtSecretKey;
process.env.JWT_REFRESH_SECRET = config.jwtRefreshSecretKey;

process.env.PORT = "4567"; // todo: make dynamic
process.env.IS_DESKTOP = "true";

const serverStarter = (() => {
  let started = false;

  async function start() {
    if (!started) {
      const { initialize } = require("./server");
      await initialize();
      started = true;
      return true;
    } else {
      return true;
    }
  }

  return {
    start,
  };
})();

function createWindow () {
  const win = new BrowserWindow({
    width: 1024,
    height: 700,
    icon: path.join(__dirname, '/web/dataramen.png'),
    webPreferences: {
      preload: __dirname + '/preload.js'
    }
  });

  win.loadFile("loading.html");

  serverStarter.start()
    .then(() => {
      return win.loadURL(`http://localhost:${process.env.PORT}`);
    });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
