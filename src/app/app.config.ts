import {APP_INITIALIZER, ApplicationConfig, importProvidersFrom} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';
import {DataService} from '../services/data.service';
import {BitbucketService} from '../services/bitbucket.service';
import {NotificationService} from '../services/notification.service';
import {BackgroundService} from '../services/background.service';
import {ElectronService, NgxElectronModule} from 'ngx-electron';
import {HttpClientModule} from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom([
      HttpClientModule,
      NgxElectronModule
    ]),
    DataService,
    BitbucketService,
    NotificationService,
    BackgroundService,
    ElectronService,
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [
        BackgroundService,
        ElectronService
      ],
      useFactory: (backgroundService: BackgroundService, electronService: ElectronService) => {
        return async () => {
          if (electronService.isElectronApp) await backgroundService.scheduleJob();
          else backgroundService.setupAlarms()
        }
      },
    }
  ]
};
