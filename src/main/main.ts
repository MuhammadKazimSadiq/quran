import {app, BrowserWindow, ipcMain} from 'electron';
import {join} from 'path';

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    icon: join(__dirname, './static/icon.ico'),
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  if (process.env.NODE_ENV === 'development') {
    const rendererPort = process.argv[2];
    mainWindow.loadURL(`http://localhost:${rendererPort}`);
  }
  else {
    mainWindow.loadFile(join(app.getAppPath(), 'renderer', 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});

// ipcMain.on('message', (event, message) => {
//   console.log(`${__dirname}: ${message}`);
// })


// sqlite3
const sqlite3 = require('sqlite3').verbose();

const pathToDbFile = join(__dirname, '../../database.sqlite');

const database = new sqlite3.Database(pathToDbFile, (err) => {
    if (err) console.error('Database opening error: ', err);
});

ipcMain.on('request', (event, arg) => {
    const sql = arg;
    database.serialize(() => {
        database.all(sql, (err, rows) => {
            event.reply('response', (err && err.message) || rows);
        });
    })
});