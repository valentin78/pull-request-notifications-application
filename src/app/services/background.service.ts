import {Injectable} from '@angular/core';
import {BitbucketService} from './bitbucket.service';
import {PullRequestActivityAction, PullRequestRole, PullRequestState} from '../models/enums';
import {ExtensionSettings, PullRequest} from '../models/models';
import {DataService} from './data.service';
import {NotificationService} from './notification.service';
import {catchError} from 'rxjs/operators';
import {of, Subject, throwError} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {ApprovedRule, CommentRule, ConflictedRule, NeedsWorkRule, ReviewerRule} from './bitbucket-pr-rules';
import Alarm = chrome.alarms.Alarm;

// @ts-ignore
let chr: any = chrome;

@Injectable()
export class BackgroundService {
  interval: number;
  public dataProcessed$!: Subject<void>;
  private settings!: ExtensionSettings;
  private lastDataFetchingTimestamp!: number;

  constructor(
    private dataService: DataService,
    private bitbucketService: BitbucketService,
    private notificationService: NotificationService) {
    this.dataProcessed$ = new Subject();
    const settings = this.dataService.getExtensionSettings();
    this.interval = settings.refreshIntervalInMinutes;
  }

  setupAlarms() {
    chr.alarms.clearAll((wasCleared: boolean) => {
      if (wasCleared) {
        console.debug('alarms cleared');
      }

      if (chr.alarms.onAlarm.hasListeners()) {
        console.error('alarm listener is already defined');
        this.showError('alarm listener is already defined');
      } else {
        chr.alarms.create({periodInMinutes: 1});
        console.debug('alarm created');

        this.addAlarmListener();

        if (chr.alarms.onAlarm.hasListeners()) {
          console.debug('alarm listener has been added');
        } else {
          console.error('alarm listener was not added');
          this.showError('alarm listener was not added');
        }
      }
    });
  }

  private addAlarmListener() {
    chr.alarms.onAlarm.addListener((alarm: Alarm) => {
      this.doWork();

      const settings = this.dataService.getExtensionSettings();
      const newInterval = settings.refreshIntervalInMinutes;
      if (settings.refreshIntervalInMinutes !== alarm.periodInMinutes) {
        console.log(`interval changed from ${alarm.periodInMinutes} to ${newInterval}, restarting alarm...`);

        chr.alarms.create({periodInMinutes: settings.refreshIntervalInMinutes});
        console.debug('alarm interval changed');
      }
    });
  }

  private showError(message: string) {
    chr.browserAction.setBadgeBackgroundColor({color: 'red'});
    chr.browserAction.setBadgeText({text: message});
  }

  doWork() {
    let runningTime = Date.now();
    this.settings = this.dataService.getExtensionSettings();
    this.lastDataFetchingTimestamp = this.dataService.getLastDataFetchingTimestamp();
    if (!this.settings.bitbucket?.isValid()) {
      console.log('setup bitbucket settings first...');
      this.notificationService.setBadge({message: '404', color: 'red', title: 'missing settings'});
      return;
    }

    this.notificationService.setBadge({message: '...', title: 'loading...', color: 'gray'});
    const processingTime = new Date();
    this.bitbucketService
      .getAllPullRequests(PullRequestState.Open)
      .subscribe(data => {
        const created = data.values.filter(v => v.author.user.name === this.settings.bitbucket?.username);
        const reviewing = data.values.filter(v => v.reviewers.some(r => r.user.name === this.settings.bitbucket?.username));
        const participant = data.values.filter(v => v.participants.some(r => r.user.name === this.settings.bitbucket?.username));

        this.handleResponse(PullRequestRole.Author, created);
        this.handleResponse(PullRequestRole.Reviewer, reviewing);
        this.handleResponse(PullRequestRole.Participant, participant);

        this.notificationService.setBadge({
          message: `${created.length + reviewing.length + participant.length}`,
          color: 'green',
          title: `created: ${created.length}\nreviewing: ${reviewing.length}\nparticipant: ${participant.length}\nlast update at ${processingTime.toLocaleTimeString()}`
        });

        this.dataService.saveLastDataFetchingTimestamp(runningTime);
        this.dataProcessed$.next();
      });
  }

  /*
  Rules:
    + New PR for review was added
    - Created PR: status changed (approved, conflicted, needs-work)
    + Comment added to a created / reviewing / participating PR (todo: check only for mentions)
    - Code conflict detected in the created / reviewing PR
    - Code conflict fixed in the created / reviewing PR
    - Created / reviewing PR was declined / removed
    - Created PR was merged
   */

  handleResponse(role: PullRequestRole, values: PullRequest[]) {
    const before = this.dataService.getPullRequests(role);

    // todo: store notified PRs somewhere to avoid spamming
    // todo: add rules to the settings, so user can select what he wants to be notified about

    this.reviewCommentsCount(before, values);
    switch (role) {
      case PullRequestRole.Author:
        this.reviewPullRequestApprovals(before, values);
        this.reviewMissingPullRequests(before, values);
        break;
      case PullRequestRole.Reviewer:
        // todo: check if code conflicts were fixed
        this.reviewNewPullRequests(before, values);
        this.reviewMissingPullRequests(before, values);
        break;
      case PullRequestRole.Participant:
        //this.reviewNewPullRequests(before, values);
        break;
    }

    this.dataService.savePullRequests(role, values);
  }

  /**
   * Check if new comments added
   * @tutorial Make sense to run it for PRs with any role
   */
  reviewCommentsCount(before: PullRequest[], now: PullRequest[]) {
    now
      .filter(n => before.some(b => b.id === n.id && b.properties.commentCount !== n.properties.commentCount))
      .forEach(n => {
        this.bitbucketService
          .getPullRequestActivities(n.fromRef.repository.project.key, n.fromRef.repository.slug, n.id)
          .subscribe(data => {
            let comments = data.values
              .filter(a => CommentRule(a, this.lastDataFetchingTimestamp, this.settings?.bitbucket?.userId));

            if (comments.length > 0) {
              // todo: comments[0].comment is a wrong value if rule matched on reply
              this.notificationService.sendNotification(
                {
                  action: PullRequestActivityAction.Commented,
                  pullRequest: n,
                  comment: comments[0].comment
                });
            }
          });
      });
  }

  /**
   * Check if there are new pull requests
   * @tutorial Make sense to run it only for PRs with REVIEWER or PARTICIPANT role
   */
  reviewNewPullRequests(before: PullRequest[], now: PullRequest[]) {
    now
      .filter(b => !before.some(n => n.id === b.id))
      .forEach(n => {
        this.bitbucketService
          .getPullRequestActivities(n.fromRef.repository.project.key, n.fromRef.repository.slug, n.id)
          .subscribe(data => {
            let isTrueReviewer = data.values
              .some(a => ReviewerRule(a, this.lastDataFetchingTimestamp, this.settings?.bitbucket?.userId));

            if (isTrueReviewer) {
              this.notificationService.sendNotification(
                {
                  action: PullRequestActivityAction.Opened,
                  pullRequest: n
                });
            }
          });
      });
  }

  /**
   * Check if pull request was removed/merged/declined
   * @tutorial Make sense to run it for PRs with AUTHOR or REVIEWER role
   */
  reviewMissingPullRequests(before: PullRequest[], now: PullRequest[]) {
    before
      .filter(b => !now.some(n => n.id === b.id))
      .forEach(b => {
        this.bitbucketService
          .getPullRequestActivities(b.fromRef.repository.project.key, b.fromRef.repository.slug, b.id)
          .pipe(catchError(error => {
            if (error instanceof HttpErrorResponse && error.status === 404) {
              this.notificationService.sendNotification(
                {
                  action: PullRequestActivityAction.Removed,
                  pullRequest: b
                });

              return of({values: []});
            } else {
              return throwError(error);
            }
          }))
          .subscribe(data => {
            let activities = data.values.filter(a =>
              (a.action === PullRequestActivityAction.Merged || a.action === PullRequestActivityAction.Declined)
              // make sure activity wasn't generated by myself
              && a.user.id !== this.settings?.bitbucket?.userId
              // check if action occurred after last running time
              && a.createdDate >= this.lastDataFetchingTimestamp);

            if (activities.length) {
              // get recent activity
              let act = activities.sort((one, two) => (one.createdDate > two.createdDate ? -1 : 1))[0];
              this.notificationService.sendNotification(
                {
                  action: act.action,
                  pullRequest: b,
                  activity: act
                });
            }
          });
      });
  }

  /**
   * Check if pull request was approved or flagged as needs-work.
   * @tutorial Make sense to run it only for PRs with AUTHOR role
   */
  reviewPullRequestApprovals(before: PullRequest[], now: PullRequest[]) {
    now
      .map(n => {
        const b = before.find(i => i.id === n.id);
        if (b) {
          const conflicted = ConflictedRule(b, n);
          const needsWork = NeedsWorkRule(b, n);
          const approved = ApprovedRule(b, n);

          let action: PullRequestActivityAction | undefined;
          if (conflicted) {
            action = PullRequestActivityAction.Conflicted;
          }
          if (needsWork) {
            action = PullRequestActivityAction.NeedsWork;
          }
          if (approved) {
            action = PullRequestActivityAction.Approved;
          }

          return {
            action: action,
            pullRequest: n
          };
        }

        // skip rule check for new pull request
        return undefined;
      })
      .forEach(i => {
        if (i?.action && i.pullRequest) {
          this.notificationService.sendNotification(
            {
              action: i.action,
              pullRequest: i.pullRequest
            });
        }
      });
  }
}
