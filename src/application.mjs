// https://www.electronjs.org/docs/latest/tutorial/installation

import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, shell } from 'electron';
import url from "url";
import path from "path";
import { fileURLToPath } from 'url';
import Store from 'electron-store';

import windowStateKeeper from './core/electron-window-state.mjs';

const projectUrl = `https://github.com/valentin78/pull-request-notifications-application`;

// if true, application will open devtools and auto open windows in fullscreen
const debugMode = false;
const title = `Pull Request Notifications v${app.getVersion()}`;

const gotInstanceLock = app.requestSingleInstanceLock();
if (!gotInstanceLock) {
  app.quit();
}

// path to application.js file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow, tray;

// assets
const assetsFolder = './assets/icons';
const windowIcoPath = path.join(__dirname, assetsFolder, `/icon64.png`);
const windowIco = nativeImage.createFromPath(windowIcoPath)

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
  let mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 800
  });

  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    icon: windowIco,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    show: debugMode,
    fullscreen: debugMode,
    closable: true,
    title: title
  })

  mainWindowState.manage(mainWindow);

  await loadUrlAsync();

  // mainWindow.getChildWindows()

  mainWindow.setMenu(null);

  if (debugMode) {
    // Open the DevTools.
    mainWindow.webContents.openDevTools()
  }

  // hide window if user clicks on close button
  mainWindow.on('close', function (evt) {
    evt.preventDefault();
    mainWindowState.saveState(mainWindow);
    mainWindow.hide();
  });

  mainWindow.on('closed', function () {
    mainWindowState.saveState(mainWindow);
    mainWindow = null
  })

  return mainWindow;
}

const showWindow = (fragment) => {
  loadUrlAsync(fragment).then(() => mainWindow.show());
}

app.on('second-instance', (event, commandLine, workingDirectory) => {
  // Someone tried to run a second instance, we should focus our window.
  showWindow();
})

app.on('ready', async () => {
  await createWindowAsync();

  const getIcon = icoFile => {
    const iconPath = path.join(__dirname, assetsFolder, `/`, icoFile);
    return nativeImage.createFromPath(iconPath)
  };

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show window',
      type: 'normal',
      click: () => showWindow(),
      icon: getIcon('application-ico.png')
    },
    {
      label: 'Options',
      type: 'normal',
      click: () => showWindow('options'),
      icon: getIcon('config-ico.png')
    },
    {
      label: 'Startup',
      type: 'checkbox',
      checked: getAutostartFlag(),
      click: item => setAutostartFlag(item.checked)
    },
    {label: '-----', type: 'separator'},
    {
      label: 'Debug',
      type: 'normal',
      click: () => openDevTools(),
      icon: getIcon('code.png')
    },
    {
      label: 'About',
      type: 'normal',
      click: () => shell.openExternal(projectUrl),
      icon: getIcon('info.png')
    },
    {label: '-----', type: 'separator'},
    {
      label: 'Close',
      type: 'normal',
      click: applicationExit,
      icon: getIcon('exit-ico.png')
    }
  ])

  tray = new Tray(windowIco)
  tray.setContextMenu(contextMenu)

  tray.setToolTip(title)
  tray.setTitle(title)

  tray.addListener('click', () => showWindow());
})

const getAutostartFlag = () => {
  return app.getLoginItemSettings({
    path: app.getPath("exe")
  })?.openAtLogin ?? false;
}

const openDevTools = () => {
  mainWindow.webContents.openDevTools();
}

const setAutostartFlag = (openAtLogin) => {
  app.setLoginItemSettings({
    openAtLogin: openAtLogin,
    openAsHidden: true,
    path: app.getPath("exe")
  });
}

const applicationExit = () => {
  if (mainWindow) {
    mainWindow.close()
    mainWindow = null;
  }
  if (process.platform !== 'darwin') app.exit(0);
}

app.on('activate', async () => {
  if (!mainWindow) await createWindowAsync()
})

app.on('window-all-closed', applicationExit);

/* ***********************************************************************
   App messages
   *********************************************************************** */

/* request-app-notification */
ipcMain.on('request-app-balloon', (event, message, iconType, title) => {
  tray?.displayBalloon({
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
  event.sender.send(`set-settings:${key}`, true);
});

ipcMain.on("navigate-to", async (event, url) => {
  await shell.openExternal(url)
});

ipcMain.on("open-dev-tools", (event, key, data) => {
  openDevTools()
});

ipcMain.on("open-project", (event, key, data) => {
  shell.openExternal(projectUrl);
});
