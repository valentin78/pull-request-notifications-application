import {EventEmitter, Injectable} from '@angular/core';
import {BitbucketService} from './bitbucket.service';
import {BitbucketCommentAction, PullRequestAction, PullRequestActivityAction, PullRequestRole, PullRequestState} from '../models/enums';
import {ExtensionSettings, PullRequest} from '../models/models';
import {DataService} from './data.service';
import {NotificationService} from './notification.service';

@Injectable()
export class BackgroundService {
  timer?: number;
  interval: number;
  public dataProcessed!: EventEmitter<PullRequestRole>;
  private settings!: ExtensionSettings;
  private lastRunningTime!: number;

  constructor(
    private dataService: DataService,
    private bitbucketService: BitbucketService,
    private notificationService: NotificationService) {
    this.dataProcessed = new EventEmitter<PullRequestRole>(true);
    const settings = this.dataService.getExtensionSettings();
    this.interval = settings.refreshIntervalInMinutes;
  }

  doWork() {
    let runningTime = Date.now();
    this.settings = this.dataService.getExtensionSettings();
    this.lastRunningTime = this.dataService.getLastRunningTimestamp();
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

        this.dataService.saveLastRunningTimestamp(runningTime);
        this.dataProcessed.emit();
      });
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
        //this.reviewNewPullRequests(before, values);
        break;
    }

    this.dataService.savePullRequests(role, values);
  }

  // run for pull requests with any role
  reviewCommentsCount(before: PullRequest[], now: PullRequest[]) {
    now
      .filter(n => before.some(b => b.id === n.id && b.properties.commentCount !== n.properties.commentCount))
      .forEach(n => {
        this.bitbucketService
          .getPullRequestActivities(n.fromRef.repository.project.key, n.fromRef.repository.slug, n.id)
          .subscribe(data => {
            let comments = data.values.filter(a =>
              a.action === PullRequestActivityAction.Commented
              // check if it's a new comment
              && a.commentAction === BitbucketCommentAction.Added
              // make sure it's not my comment
              && (
                a.comment?.author.id !== this.settings?.bitbucket?.userId
                // check for first-level replies, todo: add recursion to go deeper
                || a.comment?.comments?.some(cc =>
                  cc.updatedDate >= this.lastRunningTime
                  && cc.author.id !== this.settings?.bitbucket?.userId)
              )
              // check if action occurred after last running time
              && a.createdDate >= this.lastRunningTime
            );

            if (comments.length > 0) {
              this.notificationService.sendNotification(
                {
                  action: PullRequestAction.Comment,
                  pullRequest: n,
                  comment: comments[0].comment
                });
            }
          });
      });
  }

  // run only for REVIEWING or PARTICIPANT role
  reviewNewPullRequests(before: PullRequest[], now: PullRequest[]) {
    now
      .filter(b => !before.some(n => n.id === b.id))
      .forEach(n => {
        this.bitbucketService
          .getPullRequestActivities(n.fromRef.repository.project.key, n.fromRef.repository.slug, n.id)
          .subscribe(data => {
            let isTrueReviewer = data.values.some(a =>
              a.action === PullRequestActivityAction.Updated
              // check if action occurred after last running time
              && a.createdDate >= this.lastRunningTime
              // make sure activity wasn't generated by myself
              && a.user.id !== this.settings?.bitbucket?.userId
              // get activities where I was added as a reviewer
              && a.addedReviewers?.some(r => r.id === this.settings?.bitbucket?.userId));

            if (isTrueReviewer) {
              this.notificationService.sendNotification(
                {
                  action: PullRequestAction.Created,
                  pullRequest: n
                });
            }
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
}
