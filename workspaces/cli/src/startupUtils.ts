/**
 *
 * WORK IN PROGRESS
 *
 */

const os = require('node:os');
const fs = require('fs-extra');
const path = require('node:path');
const { exec } = require('node:child_process');
const util = require("node:util");

const execPromise = util.promisify(exec);

const SCRIPT = "dataramen start";
// Detect platform
const platform = os.platform();

const WINDOWS_TASK_NAME = "DataRamenStart";
const MAC_LABEL = "app.dataramen.xyz";

// -------- WINDOWS -------- //
async function registerOnWindows() {
  const cmd = `schtasks /Create /TN "${WINDOWS_TASK_NAME}" /TR "'${SCRIPT}'" /SC ONLOGON /RL HIGHEST /F`;
  await execPromise(cmd);
  console.log('✅ Registered on Windows startup.');
}

async function unregisterOnWindows() {
  await execPromise(`schtasks /Delete /TN "${WINDOWS_TASK_NAME}" /F`);
  console.log('🗑️ Unregistered from Windows startup.');
}

// -------- MAC -------- //
async function registerOnMac() {
  const plistPath = path.join(os.homedir(), 'Library/LaunchAgents', `${MAC_LABEL}.plist`);

  const plist = `<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    <plist version="1.0">
    <dict>
      <key>Label</key>
      <string>${MAC_LABEL}</string>
      <key>ProgramArguments</key>
      <array>
        <string>${SCRIPT}</string>
      </array>
      <key>RunAtLoad</key>
      <true/>
    </dict>
    </plist>`
  ;

  await fs.writeFile.__promisify__(plistPath, plist, 'utf8');
  await execPromise(`launchctl load ${plistPath}`);
  console.log('✅ Registered on macOS startup.');
}

async function unregisterOnMac() {
  const plistPath = path.join(os.homedir(), 'Library/LaunchAgents', `${MAC_LABEL}.plist`);
  await execPromise(`launchctl unload ${plistPath}`);
  await fs.unlink.__promisify__(plistPath);
  console.log('🗑️ Unregistered from macOS startup.');
}

// -------- LINUX -------- //
async function registerOnLinux() {
  throw new Error("Not supported on Linux");
  // exec('crontab -l', (err, stdout) => {
  //   const line = `@reboot ${SCRIPT}`;
  //   let crontab = stdout || '';
  //   if (!crontab.includes(line)) {
  //     crontab += `\n${line}\n`;
  //     const child = exec('crontab -');
  //     child.stdin.write(crontab);
  //     child.stdin.end();
  //     console.log('✅ Registered on Linux startup (crontab).');
  //   }
  // });
}

async function unregisterOnLinux() {
  throw new Error("Not supported on Linux");
  // exec('crontab -l', (err, stdout) => {
  //   if (err) return console.error('Linux crontab read error:', err);
  //
  //   const line = `@reboot ${SCRIPT}`;
  //   const updated = stdout
  //     .split('\n')
  //     .filter(l => !l.includes(line))
  //     .join('\n');
  //
  //   const child = exec('crontab -');
  //   child.stdin.write(updated);
  //   child.stdin.end();
  //   console.log('🗑️ Unregistered from Linux startup.');
  // });
}

// -------- REGISTER FUNCTIONS -------- //
async function register() {
  switch (platform) {
    case 'win32': return registerOnWindows();
    case 'darwin': return registerOnMac();
    case 'linux': return registerOnLinux();
  }
}

async function unregister() {
  switch (platform) {
    case 'win32': return unregisterOnWindows();
    case 'darwin': return unregisterOnMac();
    case 'linux': return unregisterOnLinux();
  }
}

module.exports = {
  register: register,
  unregister: unregister,
};
