import {BitbucketSettings, ExtensionSettings, SlackSettings} from '../../models/models';
import {DataService} from '../../services/data.service';
import {BitbucketService} from '../../services/bitbucket.service';
import {forkJoin, of, Subject, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {ChangeDetectorRef, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {SLACK_API_URL, SlackClient} from '../../services/slackClient';
import {BackgroundService} from '../../services/background.service';
import {NotificationService} from '../../services/notification.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

class StatusMessage {
  message!: string;
  type?: 'info' | 'error';
  hideAfter?: number;
}

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
})
export class OptionsComponent implements OnInit {

  settings!: ExtensionSettings;
  statusMessage?: StatusMessage;

  enableBrowserNotifications!: boolean;
  enableSlackNotifications!: boolean;
  slackSettings!: SlackSettings;
  bitbucketSettings!: BitbucketSettings;

  private statusMessage$: Subject<StatusMessage>;

  private _destroyRef = inject(DestroyRef);

  constructor(
    private settingsService: DataService,
    private bitbucketService: BitbucketService,
    private backgroundService: BackgroundService,
    private notificationService: NotificationService,
    private cd: ChangeDetectorRef) {

    settingsService.getExtensionSettings().then(settings => {
      this.settings = settings;
      this.enableBrowserNotifications = this.settings.notifications.browser;
      this.enableSlackNotifications = !!this.settings.notifications.slack;
      this.slackSettings = this.settings.notifications.slack || new SlackSettings();
      this.bitbucketSettings = this.settings.bitbucket || new BitbucketSettings();
    })
    this.statusMessage$ = new Subject();
  }

  ngOnInit(): void {
    this.statusMessage$
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(msg => this.showStatusMessage(msg));
  }

  onSave() {
    this.requestPermissions((granted) => {
      if (granted) {
        this.saveSettings();
      } else {
        this.statusMessage$.next({message: 'permissions not allowed', type: 'error'});
      }
    });
  }

  onSlackTest() {
    let slackClient = new SlackClient(this.slackSettings.token);

    const postMessage = () => {
      slackClient
        .postMessage({
          'channel': this.slackSettings.memberId,
          'text': 'hello'
        })
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe((data: any) => {
          if (!data.ok) {
            this.statusMessage$.next({type: 'error', message: data.error || 'wrong slack credentials'});
          } else {
            this.statusMessage$.next({message: 'message sent'});
          }
        });
    }

    if (chrome.permissions)
      chrome.permissions.request(
        {origins: [`${SLACK_API_URL}/*`]},
        (granted) => {
          if (granted) postMessage();
          else
            this.statusMessage$.next({message: 'permissions not allowed', type: 'error'});
        });
    else postMessage();
  }

  private showStatusMessage(msg: StatusMessage) {
    console.debug('status message:', msg);
    this.statusMessage = msg;
    this.cd.detectChanges();
    if (msg.hideAfter || 5000 > 0) {
      setTimeout(() => {
        this.statusMessage = undefined;
        this.cd.detectChanges();
      }, msg.hideAfter || 5000);
    }
  }

  // validate & save settings to local storage
  private saveSettings() {
    this.statusMessage$.next({message: 'saving...', hideAfter: 0});

    const bitbucketValidate$ = this.bitbucketService.validateCredentials(
      this.bitbucketSettings.url,
      this.bitbucketSettings.token,
      this.bitbucketSettings.username
    ).pipe(
      catchError((error, _) => {
        this.statusMessage$.next({type: 'error', message: 'wrong bitbucket credentials'});
        return throwError(error);
      })
    );

    let slackClient = new SlackClient();
    const slackValidate$ = this.enableSlackNotifications
      ? slackClient.testAuth(this.slackSettings.token).pipe(
        tap((data: any) => {
          if (!data.ok) {
            throw new Error('wrong slack credentials');
          }
        }),
        catchError((error: Error, _) => {
          this.statusMessage$.next({type: 'error', message: error.message});
          return throwError(error);
        })
      )
      : of(null);

    forkJoin([
      bitbucketValidate$,
      slackValidate$
    ]).pipe(
      takeUntilDestroyed(this._destroyRef)
    ).subscribe(async _ => {
      this.settings.bitbucket = this.bitbucketSettings;
      this.settings.bitbucket.userId = _[0].id;

      this.settings.notifications.slack = this.enableSlackNotifications
        ? this.slackSettings
        : undefined;
      await this.settingsService.saveExtensionSettings(this.settings);

      // fetch data
      await this.backgroundService.doWork();

      this.statusMessage$.next({message: 'saved!'});
    });
  }

  // request permission to access bitbucket & slack hosts
  private requestPermissions(callback: (granted: boolean) => void) {
    let origins = [];
    const bbHost = `${new URL(this.bitbucketSettings.url || '').origin}/*`;
    origins.push(bbHost);

    if (this.enableSlackNotifications) {
      origins.push(`${SLACK_API_URL}/*`);
    }

    if (chrome.permissions)
      chrome.permissions.request({origins: origins}, (d) => callback(d));
    else
      callback(true);
  }

  onEnableBrowserNotifications(event: MouseEvent) {
    if (!this.enableBrowserNotifications) {
      this.notificationService
        .requestPermission()
        .subscribe(permission => {
          console.debug('permission:', permission);
          if (permission === 'granted') {
            this.settings.notifications.browser = true;
          } else {
            this.enableBrowserNotifications = false;
            this.settings.notifications.browser = false;
          }
        });
    } else {
      this.settings.notifications.browser = false;
    }
  }

  onBrowserNotificationTest() {
    this.notificationService.sendBrowserNotification('test', 'hello', 'https://www.mozilla.org');
  }
}

