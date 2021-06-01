import {EventEmitter, Injectable} from '@angular/core';
import {BitbucketService} from './bitbucket.service';
import {PullRequestRole} from '../models/enums';
import {PullRequest} from '../models/models';
import {DataService} from './data.service';
import {NotificationService} from './notification.service';

@Injectable()
export class BackgroundService {
  timer?: number;
  interval: number;
  public prResponseProcessor!: EventEmitter<PullRequestRole>;

  constructor(
    private dataService: DataService,
    private bitbucketService: BitbucketService,
    private notificationService: NotificationService) {
    this.prResponseProcessor = new EventEmitter<PullRequestRole>(true);
    const settings = this.dataService.getExtensionSettings();
    this.interval = settings.refreshIntervalInSeconds;
  }

  setupWorker() {
    if (!this.timer) {
      // todo: replace with chrome alarm
      const self = this;
      this.timer = setInterval(() => {
        self.do();



        // // @ts-ignore
        // chrome.browserAction.setBadgeText({text: new Date().getSeconds().toString()});
        // // @ts-ignore
        // chrome.browserAction
        //   .setTitle(
        //     {
        //       title: `a: ${this.authored.length}, r: ${this.reviewing.length}, p: ${this.participant.length}`
        //     });



        const settings = self.dataService.getExtensionSettings();
        const newInterval = settings.refreshIntervalInSeconds;
        if (settings.refreshIntervalInSeconds !== self.interval) {
          console.log(`interval changed from ${self.interval} to ${newInterval}, restarting worker...`);
          self.interval = newInterval;
          self.stopWorker();
          self.setupWorker();
        }
      }, this.interval * 1000);
      console.log('worker set');
    } else {
      console.log('worker is running already');
    }
  }

  stopWorker() {
    clearInterval(this.timer);
    this.timer = undefined;
    console.log('worker stopped');
  }

  do() {
    const settings = this.dataService.getExtensionSettings();
    if (!settings.bitbucket.isValid()) {
      console.log('setup bitbucket settings first...');
      return;
    }

    this.bitbucketService
      .getPullRequests(PullRequestRole.Author)
      .subscribe(data => this.handleResponse(PullRequestRole.Author, data.values));

    this.bitbucketService
      .getPullRequests(PullRequestRole.Reviewer)
      .subscribe(data => this.handleResponse(PullRequestRole.Reviewer, data.values));

    this.bitbucketService
      .getPullRequests(PullRequestRole.Participant)
      .subscribe(data => this.handleResponse(PullRequestRole.Participant, data.values));

    console.log('done');
  }

  handleResponse(role: PullRequestRole, values: PullRequest[]) {
    const before = this.dataService.getPullRequests(role);

    this.reviewCommentsCount(before, values);
    switch (role) {
      case PullRequestRole.Author:
        this.reviewMissingPullRequests(before, values);
        break;
      case PullRequestRole.Reviewer:
        this.reviewNewPullRequests(before, values);
        this.reviewMissingPullRequests(before, values);
        break;
      case PullRequestRole.Participant:
        this.reviewNewPullRequests(before, values);
        break;
    }

    this.dataService.savePullRequests(role, values);

    // todo: update badge text
    // chrome.action
    //   .getBadgeText({})
    //   .then((text: string) => {
    //     chrome.action.setBadgeText({text: 'test'});
    //   });

    // todo: send message using 'chrome'
    this.prResponseProcessor.emit(role);
  }

  // run for pull requests with any role
  reviewCommentsCount(before: PullRequest[], now: PullRequest[]) {
    before
      .filter(b => now.some(n => n.id === b.id && n.properties.commentCount !== b.properties.commentCount))
      .forEach(b => {
        // todo: perform deep event processing
        // - check if comment is not mine or not
        //
        debugger;
        this.notificationService.sendNotification(
          b.title,
          {
            body: 'comment(s) added'
          });
      });

  }

  // run only for REVIEWING or PARTICIPANT role
  reviewNewPullRequests(before: PullRequest[], now: PullRequest[]) {
    now
      .filter(b => !before.some(n => n.id === b.id))
      .forEach(b => {
        this.notificationService.sendNotification(
          b.title,
          {
            body: 'new pull request created'
          });
      });

  }

  reviewMissingPullRequests(before: PullRequest[], now: PullRequest[]) {
    before
      .filter(b => !now.some(n => n.id === b.id))
      .forEach(b => {
        // todo: check missing PR, was it merged / declined ?
      });

  }
}
