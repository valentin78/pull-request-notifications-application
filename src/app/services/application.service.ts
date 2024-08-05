import {inject, Injectable} from '@angular/core';
import {ElectronService} from "ngx-electron";

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private _electronService = inject(ElectronService);

  public navigateTo(url: string) {
    if (this._electronService.isElectronApp)
      this._electronService.ipcRenderer.send('navigate-to', url);
      else window.open(url);
  }

  public getSettings(key: string): Promise<any> {
    if (this._electronService.isElectronApp)
      return new Promise((resolve, reject) => {
        // send request to load settings
        this._electronService.ipcRenderer.send('request-settings', key);
        // wait for response
        this._electronService.ipcRenderer.once(`settings-data:${key}`, (ev, data: any) => {
          resolve(data);
        });
      });

    return new Promise(resolve => {
      const json = localStorage.getItem(key);
      const data = json ? JSON.parse(json) : undefined;
      resolve(data)
    });
  }

  public setSettings(key: string, data: any): Promise<any> {
    if (this._electronService.isElectronApp)
      return new Promise((resolve, reject) => {
        // send request to load settings
        this._electronService.ipcRenderer.send('set-settings', key, data);
        // wait for response
        this._electronService.ipcRenderer.once(`set-settings:${key}`, (ev, result) => {
          if (result) resolve(data);
        });
      });

    localStorage.setItem(key, JSON.stringify(data));
    return new Promise(resolve => resolve(data));
  }

  showBalloon(title: string, body: string) {
    if (this._electronService.isElectronApp)
      this._electronService.ipcRenderer.send('request-app-balloon', body, 'info', title);
  }
}
