# Bitbucket Pull Request Notifications

Desktop version of [pull-request-notifications chrome extension](https://github.com/spaduret/pull-request-notifications), authored by Sergei Paduret. 

Uses [Electron](https://www.electronjs.org/) and [Electron-Builder](https://www.electron.build/) libraries to build desktop application. 

## Run and Build Instructions

- run `npm run start:electron` to run application in DEV mode
- run `npm run make:dir` to build application 
- run `npm run make:dist` to build setup 

## Additional Opportunities
- Application runs in tray and allows open window by tray menu or click on tray icon
- Allow to run application at login, use tray menu

## Known problems and TODO
- add ability to display badge on taskbar
- block to run more than one copy of application
- refactor code to use new Angular features
- get rid of uses chrome api (clear code), and replace with electron api
- fix issue with setup
