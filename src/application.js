// https://www.electronjs.org/docs/latest/tutorial/installation

import {app, BrowserWindow, ipcMain, Tray, Menu, nativeImage} from 'electron';
import url from "url";
import path from "path";
import {fileURLToPath} from 'url';

import Store from 'electron-store';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow, tray;

const assetsFolder = './assets/icons';
const windowIcoPath = path.join(__dirname, assetsFolder, `/icon64.png`);
const windowIco = nativeImage.createFromPath(windowIcoPath)

//const settingsFolder = path.join(app.getPath('userData'), `/settings`);
//storage.setDataPath(settingsFolder)

const loadUrlAsync = async (fragment) => {
  await mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, `../dist/browser/index.html`),
      protocol: "file:",
      slashes: true,
      hash: fragment
    })
  )
};

async function createWindowAsync() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    icon: windowIco,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    show: false,
    closable: true
  })

  await loadUrlAsync();

  mainWindow.getChildWindows()

  mainWindow.setMenu(null);

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  mainWindow.on('close', function (evt) {
    evt.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('closed', function () {
    mainWindow = null
  })

  return mainWindow;
}

const showWindow = (fragment) => {
  loadUrlAsync(fragment).then(() => mainWindow.show());
}

app.on('ready', async () => {
  await createWindowAsync();

  const exitIconPath = path.join(__dirname, assetsFolder, `/exit-ico.png`);
  const configIconPath = path.join(__dirname, assetsFolder, `/config-ico.png`);
  const appIconPath = path.join(__dirname, assetsFolder, `/application-ico.png`);
  const exitIcon = nativeImage.createFromPath(exitIconPath)
  const configIcon = nativeImage.createFromPath(configIconPath)
  const appIcon = nativeImage.createFromPath(appIconPath)
  tray = new Tray(windowIco)
  const contextMenu = Menu.buildFromTemplate([
    {label: 'View PR\'s', type: 'normal', click: () => showWindow(), icon: appIcon},
    {label: 'Options', type: 'normal', icon: configIcon, click: () => showWindow('options')},
    {label: '-----', type: 'separator'},
    {label: 'Close', type: 'normal', click: applicationExit, icon: exitIcon}
  ])

  tray.setContextMenu(contextMenu)

  tray.setToolTip('Pull Request Notifications')
  tray.setTitle('Pull Request Notifications')

  tray.addListener('click', () => showWindow());
})

const applicationExit = () => {
  if (process.platform !== 'darwin') app.exit(0);
}

app.on('activate', async () => {
  if (mainWindow === null) await createWindowAsync()
})

app.on('window-all-closed', applicationExit);

/* ***********************************************************************
   App messages
   *********************************************************************** */

/* request-app-notification */
ipcMain.on('request-app-balloon', (event, message, iconType, title) => {
  tray.displayBalloon({
    title: title,
    iconType: iconType ?? 'info',
    content: message,
  });
});

ipcMain.on("request-settings", (event, key) => {
  const store = new Store();
  const value = store.get(key);
  event.sender.send(`settings-data:${key}`, value);
});


ipcMain.on("set-settings", (event, key, data) => {
  const store = new Store();
  store.set(key, data);
  event.sender.send(`"set-settings:${key}`, true);
});

/*
app.setLoginItemSettings({
  openAtLogin: arg.settings.startOnStartup,
  path: electron.app.getPath("exe")
});
*/
