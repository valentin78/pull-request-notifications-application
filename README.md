# Bitbucket Pull Request Notifications

Desktop version of [pull-request-notifications-chrome-extension](https://github.com/spaduret/pull-request-notifications), authored by Sergei Paduret. 

Uses [Electron](https://www.electronjs.org/) and [Electron-Builder](https://www.electron.build/) libraries to build desktop application.
Icons: https://www.flaticon.com/

![main-window](https://github.com/user-attachments/assets/8b2e1803-fc84-4cb6-a888-b95eb3c85dde)
![options](https://github.com/user-attachments/assets/60cbbc25-df15-4177-848e-e1517c9d67a8)


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
- ability to group pull requests, added link to task (extended options)

## Known problems and TODO
- fix: issue with notification icon
- get rid of chrome api usage (clear code), and replace with electron api
- add ability to display badge on taskbar https://www.electronjs.org/docs/latest/tutorial/windows-taskbar
- refactor & improve options

# Changelog
All notable changes to this project will be documented in this file.

## v1.0.8
### Changed
- fixed core dependency

## v1.0.9
### Changed
- improved context menu

## v1.0.10
### Changed
- updated icons
- fix: show author

## v1.0.11
### Changed
- improved toolbar

