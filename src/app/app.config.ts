import {APP_INITIALIZER, ApplicationConfig, importProvidersFrom} from '@angular/core';
import {ActivatedRoute, provideRouter, Router} from '@angular/router';
import {routes} from './app.routes';
import {DataService} from '../services/data.service';
import {BitbucketService} from '../services/bitbucket.service';
import {NotificationService} from '../services/notification.service';
import {BackgroundService} from '../services/background.service';
import {ElectronService, NgxElectronModule} from 'ngx-electron';
import {HttpClientModule} from '@angular/common/http';
import {SlackClientService} from '../services/slack-client.service';

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
    SlackClientService,
    ElectronService,
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [
        BackgroundService,
        ElectronService,
        ActivatedRoute,
        Router
      ],
      useFactory: (
        backgroundService: BackgroundService,
        electronService: ElectronService,
        activatedRoute: ActivatedRoute,
        router: Router) => {
        // handle menu navigation to /#options and redirect to /options
        activatedRoute.fragment.subscribe(fragment => {
          if (fragment === 'options') router.navigate(['options']);
        });
        // schedule jobs
        return async () => {
          if (electronService.isElectronApp) await backgroundService.scheduleJob();
          else backgroundService.setupAlarms()
        }
      },
    }
  ]
};
