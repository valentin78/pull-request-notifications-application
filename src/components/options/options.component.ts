import {BitbucketSettings, ExtensionSettings, SlackSettings} from '../../models/models';
import {DataService} from '../../services/data.service';
import {BitbucketService} from '../../services/bitbucket.service';
import {forkJoin, of, Subject, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {ChangeDetectorRef, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {BackgroundService} from '../../services/background.service';
import {NotificationService} from '../../services/notification.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {StatusMessage} from '../../models/statusMessage';
import {FormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {SLACK_API_URL, SlackClientService} from '../../services/slack-client.service';

@Component({
  selector: 'app-options',
  standalone: true,
  templateUrl: './options.component.html',
  imports: [
    FormsModule,
    RouterLink
  ],
  styleUrls: ['./options.component.scss']
})
export class OptionsComponent implements OnInit {

  settings!: ExtensionSettings;
  statusMessage?: StatusMessage;

  enableBrowserNotifications!: boolean;
  enableSlackNotifications!: boolean;
  slackSettings!: SlackSettings;
  bitbucketSettings!: BitbucketSettings;

  private statusMessage$: Subject<StatusMessage> = new Subject();

  private _destroyRef = inject(DestroyRef);
  private _settingsService = inject(DataService);
  private _bitbucketService = inject(BitbucketService);
  private _backgroundService = inject(BackgroundService);
  private _notificationService = inject(NotificationService);
  private _changeRef = inject(ChangeDetectorRef);
  private _slackClientService = inject(SlackClientService);

  constructor() {
    this._settingsService.getExtensionSettings().then(settings => {
      this.settings = settings;
      this.enableBrowserNotifications = this.settings.notifications.browser;
      this.enableSlackNotifications = !!this.settings.notifications.slack;
      this.slackSettings = this.settings.notifications.slack || new SlackSettings();
      this.bitbucketSettings = this.settings.bitbucket || new BitbucketSettings();
    })
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
    const postMessage = () => {
      this._slackClientService
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
    this._changeRef.detectChanges();
    if (msg.hideAfter || 5000 > 0) {
      setTimeout(() => {
        this.statusMessage = undefined;
        this._changeRef.detectChanges();
      }, msg.hideAfter || 5000);
    }
  }

  // validate & save settings to local storage
  private saveSettings() {
    this.statusMessage$.next({message: 'saving...', hideAfter: 0});

    const bitbucketValidate$ = this._bitbucketService.validateCredentials(
      this.bitbucketSettings.url,
      this.bitbucketSettings.token,
      this.bitbucketSettings.username
    ).pipe(
      catchError((error, _) => {
        this.statusMessage$.next({type: 'error', message: 'wrong bitbucket credentials'});
        return throwError(error);
      })
    );

    const slackValidate$ = this.enableSlackNotifications
      ? this._slackClientService.testAuth(this.slackSettings.token).pipe(
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
    ).subscribe(async ([bitbucketResult, _]) => {
      this.settings.bitbucket = this.bitbucketSettings;
      this.settings.bitbucket.userId = bitbucketResult.id;

      this.settings.notifications.slack = this.enableSlackNotifications
        ? this.slackSettings
        : undefined;
      await this._settingsService.saveExtensionSettings(this.settings);

      // fetch data
      await this._backgroundService.doWork();

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
      this._notificationService
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
    this._notificationService.sendBrowserNotification('test', 'hello', 'https://www.mozilla.org');
  }
}

