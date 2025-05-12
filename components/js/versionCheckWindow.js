const { app, ipcMain, screen, BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

const { restrictSingleWindow, setPersistentState } = require('./commonUtils');

const HTML_MAPS = {
  check_update: `file://${path.join(__dirname, '../html/version-check.html')}`,
  update_available: `file://${path.join(
    __dirname,
    '../html/download-new-version.html'
  )}`,
  download_progress: `file://${path.join(
    __dirname,
    '../html/downloading-new-version.html'
  )}`,
};

let window;

const createVersionCheckWindow = async (paramObj) => {
  console.log('Creating version check window');
  const windowConfig = {
    frame: false,
    show: false,
    maximizable: false,
    minimizable: false,
    movable: false,
    webPreferences: {
      devTools: true,
      nodeIntegration: true,
      contextIsolation: false,
    },
  };

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  window = new BrowserWindow(windowConfig);

  window.loadURL(HTML_MAPS['check_update']);
  window.setTitle('Update Demo');
  window.setBounds({
    width: 800,
    height: 600,
    x: parseInt(width / 2) - 400,
    y: parseInt(height / 2) - 300,
  });
  window.setResizable(false);
  window.setContentProtection(true);

  window.webContents.on('did-finish-load', () => {
    window.show();
  });

  if (process.env.NODE_ENV === 'development') {
    window.webContents.openDevTools();
  }

  restrictSingleWindow(window);

  window.on('closed', () => {
    window = null;
  });

  if (process.env.ENV === 'dev') {
    // In dev mode, skip version check
    window.close();
    createDefaultWindow();
  } else {
    // Configure auto-updater events
    autoUpdater.on('update-not-available', (info) => {
      console.log('No update available:', info);
      window.close();
      createDefaultWindow();
    });

    autoUpdater.on('update-available', (info) => {
      console.log(
        `Found updated version: current version: ${app.getVersion()} new version: ${
          info.version
        }`
      );
      window.loadURL(HTML_MAPS['update_available']);

      window.webContents.on('did-finish-load', () => {
        window.webContents.send('to-download-new-version', {
          event: 'update-available',
          info: info,
        });
      });
    });

    autoUpdater.on('error', (err, errorMessage) => {
      console.log(`Download failed: ${err}`);
      let message = {
        event: 'error',
        message: 'Error while downloading the update.',
        error: err,
        errorMessage: errorMessage,
      };

      window.webContents.send('to-downloading-new-version', message);
    });

    autoUpdater.on('download-progress', (progressObj) => {
      console.log('Download progress:', progressObj.percent);

      let message = {
        event: 'download_progress',
        download_speed:
          Math.round((progressObj.bytesPerSecond / 1e6) * 100) / 100,
        downloaded_percent: Math.round((progressObj.percent * 100) / 100),
        transferred: Math.round((progressObj.transferred / 1e6) * 100) / 100,
        total_size: Math.round((progressObj.total / 1e6) * 100) / 100,
        download_time:
          (progressObj.total - progressObj.transferred) /
          progressObj.bytesPerSecond,
        delta: Math.round((progressObj.delta / 1e6) * 100) / 100,
      };

      if (progressObj.bytesPerSecond == 0) message['download_time'] = 0;

      const min = Math.round(message['download_time'] / 60);
      const sec = Math.round(message['download_time'] % 60);
      let timeStr = '';

      if (min > 1) timeStr += min + ' Mins ';
      else timeStr += min + ' Min ';

      if (sec > 1) timeStr += sec + ' Secs';
      else timeStr += sec + ' Sec';

      message['download_time'] = timeStr;

      window.webContents.send('to-downloading-new-version', message);
    });

    autoUpdater.on('update-downloaded', (info) => {
      console.log(`Download successfully completed: ${info}`);

      window.webContents.send('to-downloading-new-version', {
        event: 'success',
        info: info,
      });

      setTimeout(() => {
        autoUpdater.quitAndInstall();
      }, 3500);
    });

    // Check for updates
    autoUpdater.checkForUpdates();
  }

  return window;
};

// Create default window when no update is available or in dev mode
const createDefaultWindow = () => {
  const defaultWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  defaultWindow.loadFile(path.join(__dirname, '../html/default.html'));
  defaultWindow.on('closed', () => app.quit());

  return defaultWindow;
};

// Handle update download request from the UI
ipcMain.on('from-download-new-version', async (event, message) => {
  window.loadURL(HTML_MAPS['download_progress']);
  autoUpdater.downloadUpdate().then((res) => {
    console.log('Downloaded update', res);
  });
});

module.exports = {
  createVersionCheckWindow,
};
