const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = __dirname;
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

// Detect Python executable
function getPythonCommand() {
  const venvPythonWin = path.join(backendDir, 'venv', 'Scripts', 'python.exe');
  const venvPythonUnix = path.join(backendDir, 'venv', 'bin', 'python');
  const rootVenvPythonWin = path.join(rootDir, 'venv', 'Scripts', 'python.exe');

  if (fs.existsSync(venvPythonWin)) return venvPythonWin;
  if (fs.existsSync(rootVenvPythonWin)) return rootVenvPythonWin;
  if (fs.existsSync(venvPythonUnix)) return venvPythonUnix;

  return process.platform === 'win32' ? 'python' : 'python3';
}

const pythonCmd = getPythonCommand();
const nodeCmd = process.execPath;
const viteScript = path.join(frontendDir, 'node_modules', 'vite', 'bin', 'vite.js');

console.log('\x1b[36m%s\x1b[0m', '=======================================================');
console.log('\x1b[36m%s\x1b[0m', '  Stock Market Risk & Correlation Analyzer');
console.log('\x1b[36m%s\x1b[0m', '  Starting both Backend and Frontend servers...');
console.log('\x1b[32m%s\x1b[0m', '  -> Backend API:  http://127.0.0.1:8000');
console.log('\x1b[32m%s\x1b[0m', '  -> Frontend App: http://localhost:5173');
console.log('\x1b[36m%s\x1b[0m', '=======================================================\n');

// 1. Launch FastAPI Backend with Uvicorn
const backendEnv = Object.assign({}, process.env, {
  PYTHONPATH: backendDir,
});

const backendProcess = spawn(
  pythonCmd,
  ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000', '--reload'],
  {
    cwd: backendDir,
    env: backendEnv,
    stdio: 'inherit',
    shell: false,
  }
);

backendProcess.on('error', (err) => {
  console.error('\x1b[31m[Backend Error]\x1b[0m Failed to spawn backend process:', err.message);
});

// 2. Launch React / Vite Frontend
const frontendProcess = spawn(
  nodeCmd,
  [viteScript],
  {
    cwd: frontendDir,
    stdio: 'inherit',
    shell: false,
  }
);

frontendProcess.on('error', (err) => {
  console.error('\x1b[31m[Frontend Error]\x1b[0m Failed to spawn frontend process:', err.message);
});

// Clean shutdown handler
let isShuttingDown = false;
function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log('\n\x1b[33m%s\x1b[0m', 'Stopping both servers...');

  if (backendProcess && !backendProcess.killed) {
    if (process.platform === 'win32') {
      try {
        spawn('taskkill', ['/pid', String(backendProcess.pid), '/f', '/t']);
      } catch (e) {}
    } else {
      backendProcess.kill('SIGINT');
    }
  }

  if (frontendProcess && !frontendProcess.killed) {
    if (process.platform === 'win32') {
      try {
        spawn('taskkill', ['/pid', String(frontendProcess.pid), '/f', '/t']);
      } catch (e) {}
    } else {
      frontendProcess.kill('SIGINT');
    }
  }

  setTimeout(() => process.exit(0), 500);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('exit', shutdown);
