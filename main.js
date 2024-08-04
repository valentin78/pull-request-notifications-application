// https://www.electronjs.org/docs/latest/tutorial/installation

const {app, BrowserWindow, ipcMain, Tray, Menu, nativeImage} = require('electron')
const url = require("url");
const path = require("path");

let mainWindow, tray;

const windowIcoPath = path.join(__dirname, `/assets/favicon.ico`);
const windowIco = nativeImage.createFromPath(windowIcoPath)

const loadUrlAsync = async (fragment) => {
  await mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/browser/index.html`),
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
      contextIsolation: false,
    },
    show: false,
    closable: true
  })

  await loadUrlAsync();

  mainWindow.getChildWindows()

  mainWindow.setMenu(null);

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

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

  const exitIconPath = path.join(__dirname, `/assets/exit-ico.png`);
  const configIconPath = path.join(__dirname, `/assets/config-ico.png`);
  const appIconPath = path.join(__dirname, `/assets/application-ico.png`);
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

  tray.setToolTip('Pull Request Viewer')
  tray.setTitle('Pull Request Viewer')

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
    content: message
  });
});

/*
app.setLoginItemSettings({
  openAtLogin: arg.settings.startOnStartup,
  path: electron.app.getPath("exe")
});
*/
