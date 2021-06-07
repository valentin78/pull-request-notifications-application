import {Injector, NgModule} from '@angular/core';
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
import {BackgroundPageComponent} from './components/background-page/background-page.component';
import {BackgroundService} from './services/background.service';

export let AppInjector: Injector;

@NgModule({
  declarations: [
    AppComponent,
    OptionsComponent,
    HomeComponent,
    PullRequestComponent,
    UserComponent,
    PullRequestStateComponent,
    BackgroundPageComponent
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
    BackgroundService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private injector: Injector) {
    AppInjector = this.injector;
  }
}
