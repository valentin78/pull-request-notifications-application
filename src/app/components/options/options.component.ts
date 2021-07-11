import {BitbucketSettings, ExtensionSettings, SlackSettings} from '../../models/models';
import {DataService} from '../../services/data.service';
import {BitbucketService} from '../../services/bitbucket.service';
import {forkJoin, of, Subject, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {SLACK_API_URL, SlackClient} from '../../services/slackClient';
import {BackgroundService} from '../../services/background.service';
import {DisposableComponent} from '../../../core/disposable-component';

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
export class OptionsComponent extends DisposableComponent implements OnInit {

  settings: ExtensionSettings;
  statusMessage?: StatusMessage;

  enableSlackNotifications: boolean;
  slackSettings: SlackSettings;
  bitbucketSettings: BitbucketSettings;

  private statusMessage$: Subject<StatusMessage>;

  constructor(
    private settingsService: DataService,
    private bitbucketService: BitbucketService,
    private backgroundService: BackgroundService,
    private cd: ChangeDetectorRef) {
    super();

    this.settings = settingsService.getExtensionSettings();

    this.enableSlackNotifications = !!this.settings.notifications.slack;
    this.slackSettings = this.settings.notifications.slack || new SlackSettings();
    this.bitbucketSettings = this.settings.bitbucket || new BitbucketSettings();
    this.statusMessage$ = new Subject();
  }

  ngOnInit(): void {
    this.statusMessage$.safeSubscribe(this, msg => this.showStatusMessage(msg));
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
    slackClient
      .postMessage({
        'channel': this.slackSettings.memberId,
        'text': 'hello'
      })
      .safeSubscribe(this, (data: any) => {
        if (!data.ok) {
          this.statusMessage$.next({type: 'error', message: data.error || 'wrong slack credentials'});
        } else {
          this.statusMessage$.next({message: 'message sent'});
        }
      });
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
    const bitbucketPromise = this.bitbucketService
      .validateCredentials(this.bitbucketSettings.url, this.bitbucketSettings.token, this.bitbucketSettings.username)
      .pipe(catchError((error, _) => {
        this.statusMessage$.next({type: 'error', message: 'wrong bitbucket credentials'});
        return throwError(error);
      }));

    let slackClient = new SlackClient();
    const slackPromise = this.enableSlackNotifications
      ? slackClient
        .testAuth(this.slackSettings.token)
        .pipe(
          tap((data: any) => {
            if (!data.ok) {
              throw 'wrong slack credentials';
            }
          }),
          catchError((error, _) => {
            this.statusMessage$.next({type: 'error', message: 'wrong slack credentials'});
            return throwError(error);
          })
        )
      : of(null);

    forkJoin([bitbucketPromise, slackPromise])
      .subscribe(_ => {
        this.settings.bitbucket = this.bitbucketSettings;
        this.settings.bitbucket.userId = _[0].id;

        this.settings.notifications.slack = this.enableSlackNotifications
          ? this.slackSettings
          : undefined;
        this.settingsService.saveExtensionSettings(this.settings);

        // fetch data
        this.backgroundService.doWork();

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

    chrome.permissions.request({origins: origins}, (d) => callback(d));
  }
}

