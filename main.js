const { app, globalShortcut, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const {
  getPersistentState,
  setPersistentState,
  removePersistentState,
} = require('./components/js/commonUtils');
const {
  createVersionCheckWindow,
} = require('./components/js/versionCheckWindow');

// Set environment
const PROD = 'production';
const DEV = 'dev';

process.env.ENV = PROD;
if (!app.isPackaged) {
  process.env.ENV = DEV;
}

// Create session identifier
const identifier = Date.now();
setPersistentState('SESSION_IDENTIFIER', identifier);
setPersistentState('SESSION_EVENT', '');

let mainWindow;

// Configure auto updater for production
if (process.env.ENV === PROD) {
  app.commandLine.appendSwitch('disable-http2');
  autoUpdater.requestHeaders = {
    'Cache-Control':
      'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  };

  // Set GitHub repo for updates
  autoUpdater.setFeedURL({
    provider: 'github',
    repo: 'electron-app-update-demo',
    owner: 'Sachin-chaurasiya',
    publisherName: ['Sachin Chaurasiya'],
  });

  autoUpdater.autoDownload = false;
  console.log('Auto updater configured');
}

// Handle version request from renderer
ipcMain.on('get-app-version', (event) => {
  event.reply('app-version', app.getVersion());
});

app.on('ready', () => {
  console.log(`App is ready with version ${app.getVersion()}`);
  mainWindow = createVersionCheckWindow({ param_url: null });
});

app.on('window-all-closed', () => {
  console.log('App window all closed');
  app.quit();
});

app.on('activate', () => {
  console.log('App activate');
  if (mainWindow === null) {
    mainWindow = createVersionCheckWindow({ param_url: null });
  }
});
