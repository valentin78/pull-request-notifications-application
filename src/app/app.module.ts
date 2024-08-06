import {APP_INITIALIZER, importProvidersFrom, Injector, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './components/app/app.component';
import {OptionsComponent} from './components/options/options.component';
import {FormsModule} from '@angular/forms';
import {DataService} from './services/data.service';
import {HomeComponent} from './components/home/home.component';
import {BitbucketService} from './services/bitbucket.service';
import {HttpClientModule} from '@angular/common/http';
import {PullRequestComponent} from './components/pull-request-view/pull-request.component';
import {UserComponent} from './components/user/user.component';
import {PullRequestStateComponent} from './components/pull-request-state/pull-request-state.component';
import {NotificationService} from './services/notification.service';
import {BackgroundService} from './services/background.service';
import {SnoozeNotificationComponent} from './components/snooze-notification/snooze-notification.component';
import {ElectronService, NgxElectronModule} from "ngx-electron";

export let AppInjector: Injector;

@NgModule({
  declarations: [
    AppComponent,
    OptionsComponent,
    HomeComponent,
    PullRequestComponent,
    UserComponent,
    PullRequestStateComponent,
    SnoozeNotificationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    DataService,
    BitbucketService,
    NotificationService,
    BackgroundService,
    importProvidersFrom([
      NgxElectronModule
    ]),
    ElectronService,
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [
        BackgroundService
      ],
      useFactory: (backgroundService: BackgroundService) => () => backgroundService.setupAlarms(),
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private injector: Injector) {
    AppInjector = this.injector;
  }
}
