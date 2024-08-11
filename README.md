# Bitbucket Pull Request Notifications

Desktop version of [pull-request-notifications-chrome-extension](https://github.com/spaduret/pull-request-notifications), authored by Sergei Paduret. 

Uses [Electron](https://www.electronjs.org/) and [Electron-Builder](https://www.electron.build/) libraries to build desktop application. 

## Run and Build Instructions

- run `npm run start:electron` to run application in DEV mode
- run `npm run make:dir` to build application 
- run `npm run make:dist` to build setup

## OS support
- Windows

## Config file path 
%userprofile%\AppData\Roaming\pull-request-notifications\config.json

## Additional Opportunities
- Application runs in tray and allows open window by tray menu or click on tray icon
- Allow to run application at login, use tray menu

## Known problems and TODO
- get rid of chrome api usage (clear code), and replace with electron api
- add ability to display badge on taskbar
- improve toolbar, add version info, link to ooptions
