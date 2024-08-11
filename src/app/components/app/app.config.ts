import {APP_INITIALIZER, ApplicationConfig, importProvidersFrom, Injector} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';
import {DataService} from '../../services/data.service';
import {BitbucketService} from '../../services/bitbucket.service';
import {NotificationService} from '../../services/notification.service';
import {BackgroundService} from '../../services/background.service';
import {ElectronService, NgxElectronModule} from 'ngx-electron';
import {HttpClientModule} from '@angular/common/http';

// todo get rid of this shit
export let AppInjector: Injector;

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
        ElectronService,
        Injector
      ],
      useFactory: (backgroundService: BackgroundService, electronService: ElectronService, injector: Injector) => {
        AppInjector = injector;
        return async () => {
          if (electronService.isElectronApp) await backgroundService.scheduleJob();
          else backgroundService.setupAlarms()
        }
      },
    }
  ]
};
