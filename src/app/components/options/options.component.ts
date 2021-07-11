import {BitbucketSettings, ExtensionSettings, SlackSettings} from '../../models/models';
import {DataService} from '../../services/data.service';
import {BitbucketService} from '../../services/bitbucket.service';
import {forkJoin, of, Subject, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {Component, OnInit} from '@angular/core';
import {SlackClient} from '../../services/slackClient';
import {BackgroundService} from '../../services/background.service';

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

  settings: ExtensionSettings;
  statusMessage?: StatusMessage;

  enableSlackNotifications: boolean;
  slackSettings: SlackSettings;
  bitbucketSettings: BitbucketSettings;

  private statusMessage$: Subject<StatusMessage>;

  constructor(
    private settingsService: DataService,
    private bitbucketService: BitbucketService,
    private backgroundService: BackgroundService) {
    this.settings = settingsService.getExtensionSettings();

    this.enableSlackNotifications = !!this.settings.notifications.slack;
    this.slackSettings = this.settings.notifications.slack || new SlackSettings();
    this.bitbucketSettings = this.settings.bitbucket || new BitbucketSettings();
    this.statusMessage$ = new Subject<StatusMessage>();
    this.statusMessage$.subscribe(msg => this.showStatusMessage(msg));
  }

  ngOnInit(): void {
  }

  private showStatusMessage(msg: StatusMessage) {
    console.debug('status message:', msg);
        this.statusMessage = msg;
        if (msg.hideAfter || 5000 > 0) {
      setTimeout(() => this.statusMessage = undefined, msg.hideAfter || 5000);
        }
  }

  onSave() {
    // let origins = [];
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

  onSlackTest() {
    let slackClient = new SlackClient(this.slackSettings.token);
    slackClient
      .postMessage({
        'channel': this.slackSettings.memberId,
        'text': 'hello'
      })
      .subscribe((data: any) => {
        if (!data.ok) {
          this.showError(data.error || 'wrong slack credentials');
        } else {
          this.showMessage('message sent');
        }
      });
  }
}

