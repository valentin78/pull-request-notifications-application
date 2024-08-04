import { __decorate } from "tslib";
import { inject, Injectable } from '@angular/core';
import { BitbucketService } from './bitbucket.service';
import { PullRequestActivityAction, PullRequestRole, PullRequestState } from '../models/enums';
import { DataService } from './data.service';
import { NotificationService } from './notification.service';
import { catchError, map, switchMap } from 'rxjs/operators';
import { forkJoin, from, of, Subject, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ApprovedRule, CommentRule, ConflictedRule, MergedOrDeclinedRule, NeedsWorkRule, ReviewerRule } from './bitbucket-pr-rules';
let BackgroundService = class BackgroundService {
    constructor() {
        this.dataService = inject(DataService);
        this.bitbucketService = inject(BitbucketService);
        this.notificationService = inject(NotificationService);
        this.dataProcessed$ = new Subject();
        const settings = this.dataService.getExtensionSettings();
        this.interval = settings.refreshIntervalInMinutes;
    }
    get dataProcessed() {
        return this.dataProcessed$.asObservable();
    }
    setupAlarms() {
        chrome.alarms.clearAll((wasCleared) => {
            if (wasCleared) {
                console.debug('alarms cleared');
            }
            if (chrome.alarms.onAlarm.hasListeners()) {
                console.error('alarm listener is already defined');
                this.showError('alarm listener is already defined');
            }
            else {
                chrome.alarms.create({ periodInMinutes: 1 });
                console.debug('alarm created');
                this.addAlarmListener();
                if (chrome.alarms.onAlarm.hasListeners()) {
                    console.debug('alarm listener has been added');
                }
                else {
                    console.error('alarm listener was not added');
                    this.showError('alarm listener was not added');
                }
            }
        });
    }
    addAlarmListener() {
        chrome.alarms.onAlarm.addListener((alarm) => {
            this.doWork();
            const settings = this.dataService.getExtensionSettings();
            const newInterval = settings.refreshIntervalInMinutes;
            if (settings.refreshIntervalInMinutes !== alarm.periodInMinutes) {
                console.log(`interval changed from ${alarm.periodInMinutes} to ${newInterval}, restarting alarm...`);
                chrome.alarms.create({ periodInMinutes: settings.refreshIntervalInMinutes });
                console.debug('alarm interval changed');
            }
        });
    }
    showError(message) {
        chrome.browserAction.setBadgeBackgroundColor({ color: 'red' });
        chrome.browserAction.setBadgeText({ text: message });
    }
    doWork() {
        let runningTime = Date.now();
        this.settings = this.dataService.getExtensionSettings();
        this.lastDataFetchingTimestamp = this.dataService.getLastDataFetchingTimestamp();
        if (!this.settings.bitbucket?.isValid()) {
            console.log('setup bitbucket settings first...');
            this.notificationService.setBadge({ message: '404', color: 'red', title: 'settings are missing' });
            return;
        }
        this.notificationService.setBadge({ message: '...', title: 'loading...', color: 'gray' });
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
    handleResponse(role, values) {
        const before = this.dataService.getPullRequests(role);
        // todo: store notified PRs somewhere to avoid spamming
        // todo: add rules to the settings, so user can select what he wants to be notified about
        this.reviewCommentsCount(before, values);
        switch (role) {
            case PullRequestRole.Author:
                this.reviewPullRequestStateChanged(before, values);
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
        // fetch comments
        this.fetchComments(before, values)
            .subscribe(_ => {
            this.dataService.savePullRequests(role, values);
        });
    }
    fetchComments(before, now) {
        const updatedPrs = now.filter(n => {
            const found = before.find(b => b.id === n.id);
            return !found && n.properties.commentCount || found && found.properties.commentCount !== n.properties.commentCount;
        });
        if (updatedPrs.length === 0) {
            const empty = [];
            return of(empty);
        }
        const requests = from(updatedPrs)
            .pipe(switchMap((pr) => this.bitbucketService
            .getPullRequestActivities(pr.fromRef.repository.project.key, pr.fromRef.repository.slug, pr.id)
            .pipe(map(data => {
            // add comments info to PR to display comments feed on UI
            let comments = data.values
                .filter(a => a.action === PullRequestActivityAction.Commented)
                .filter(a => pr.comments?.some(c => c.id === a.id) !== true);
            pr.comments = (pr.comments ?? []).concat(comments).sort((a, b) => a.createdDate - b.createdDate);
            // // check if it's not a new PR
            // // for the new PRs we get another notification
            // if (before.some(b => b.id === pr.id)) {
            //   let newComments = data.values
            //     .filter(a => CommentRule(a, this.lastDataFetchingTimestamp, this.settings?.bitbucket?.userId));
            //
            //   // check if there are new comments
            //   if (newComments.length > 0) {
            //     // todo: comments[0].comment is a wrong value if rule matched on reply
            //     this.notificationService.sendNotification(
            //       {
            //         action: PullRequestActivityAction.Commented,
            //         pullRequest: pr,
            //         comment: newComments[0].comment
            //       });
            //   }
            // }
            return { pr: pr, activities: data };
        }))));
        return forkJoin([requests]);
    }
    /**
     * Check if new comments added
     * @tutorial Make sense to run it for PRs with any role
     */
    reviewCommentsCount(before, now) {
        if (!this.settings.notifications.events.commentAdded) {
            return;
        }
        now
            .filter(n => before.some(b => b.id === n.id && b.properties.commentCount !== n.properties.commentCount))
            .forEach(pr => {
            this.bitbucketService
                .getPullRequestActivities(pr.fromRef.repository.project.key, pr.fromRef.repository.slug, pr.id)
                .subscribe(data => {
                let comments = data.values
                    .filter(a => CommentRule(a, this.lastDataFetchingTimestamp, this.settings?.bitbucket?.userId));
                if (comments.length > 0) {
                    // todo: comments[0].comment is a wrong value if rule matched on reply
                    this.notificationService.sendNotification({
                        action: PullRequestActivityAction.Commented,
                        pullRequest: pr,
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
    reviewNewPullRequests(before, now) {
        if (!this.settings.notifications.events.pullRequestCreated) {
            return;
        }
        now
            .filter(b => !before.some(n => n.id === b.id))
            .forEach(n => {
            this.bitbucketService
                .getPullRequestActivities(n.fromRef.repository.project.key, n.fromRef.repository.slug, n.id)
                .subscribe(data => {
                let isTrueReviewer = data.values
                    .some(a => ReviewerRule(a, this.lastDataFetchingTimestamp, this.settings?.bitbucket?.userId));
                if (isTrueReviewer) {
                    this.notificationService.sendNotification({
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
    reviewMissingPullRequests(before, now) {
        if (!this.settings.notifications.events.pullRequestStateChanged) {
            return;
        }
        before
            .filter(b => !now.some(n => n.id === b.id))
            .forEach(b => {
            this.bitbucketService
                .getPullRequestActivities(b.fromRef.repository.project.key, b.fromRef.repository.slug, b.id)
                .pipe(catchError(error => {
                if (error instanceof HttpErrorResponse && error.status === 404) {
                    this.notificationService.sendNotification({
                        action: PullRequestActivityAction.Removed,
                        pullRequest: b
                    });
                    return of({ values: [] });
                }
                else {
                    return throwError(error);
                }
            }))
                .subscribe(data => {
                let activities = data.values
                    .filter(a => MergedOrDeclinedRule(a, this.lastDataFetchingTimestamp, this.settings?.bitbucket?.userId));
                if (activities.length) {
                    // get recent activity
                    let act = activities.sort((one, two) => (one.createdDate > two.createdDate ? -1 : 1))[0];
                    this.notificationService.sendNotification({
                        action: act.action,
                        pullRequest: b,
                        activity: act
                    });
                }
            });
        });
    }
    /**
     * Check if pull request was approved or flagged as needs-work or got code conflicts.
     * @tutorial Make sense to run it only for PRs with AUTHOR role
     */
    reviewPullRequestStateChanged(before, now) {
        if (!this.settings.notifications.events.pullRequestStateChanged) {
            return;
        }
        now
            .map(n => {
            const b = before.find(i => i.id === n.id);
            if (b) {
                const conflicted = ConflictedRule(b, n);
                const needsWork = NeedsWorkRule(b, n);
                const approved = ApprovedRule(b, n);
                let action;
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
                this.notificationService.sendNotification({
                    action: i.action,
                    pullRequest: i.pullRequest
                });
            }
        });
    }
};
BackgroundService = __decorate([
    Injectable()
], BackgroundService);
export { BackgroundService };
//# sourceMappingURL=background.service.js.map