import {inject, Injectable} from '@angular/core';
import {ElectronService} from "ngx-electron";

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private _electronService = inject(ElectronService);

  public getSettings(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // send request to load settings
      this._electronService.ipcRenderer.send('request-settings', key);
      // wait for response
      this._electronService.ipcRenderer.once('settings-data', (ev, error, data: any) => {
        if (error) reject(error)
        else resolve(data);
      });
    });
  }

  public setSettings(key: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // send request to load settings
      this._electronService.ipcRenderer.send('set-settings', key, data);
      // wait for response
      this._electronService.ipcRenderer.once('set-settings-result', (ev, error) => {
        if (error) reject(error)
        else resolve(data);
      });
    });
  }

  showBalloon(title: string, body: string) {
    if (this._electronService.isElectronApp)
      this._electronService.ipcRenderer.send('request-app-balloon', body, 'info', title);
  }
}
