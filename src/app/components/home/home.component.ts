import {Component, EventEmitter, Injectable, OnInit} from '@angular/core';
import {BitbucketService} from '../../services/bitbucket.service';
import {PullRequestRole} from '../../models/enums';
import {PullRequest} from '../../models/models';
import {NotificationService} from '../../services/notification.service';
import {DataService} from '../../services/data.service';

@Component({
  selector: 'app-main',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  authored: PullRequest[];
  reviewing: PullRequest[];
  participant: PullRequest[];

  prResponseProcessor!: EventEmitter<PullRequestRole>;

  constructor(
    private bitbucketService: BitbucketService,
    private notificationService: NotificationService,
    private dataService: DataService) {
    this.prResponseProcessor = new EventEmitter<PullRequestRole>(true);

    this.authored = [];
    this.reviewing = [];
    this.participant = [];

    this.readPullRequestData(undefined);
  }

  ngOnInit(): void {
    this.prResponseProcessor
      .subscribe(role => this.readPullRequestData(role));

    this.bitbucketService
      .getPullRequests(PullRequestRole.Author)
      .subscribe(data => this.handleResponse(PullRequestRole.Author, data.values));

    this.bitbucketService
      .getPullRequests(PullRequestRole.Reviewer)
      .subscribe(data => this.handleResponse(PullRequestRole.Reviewer, data.values));

    this.bitbucketService
      .getPullRequests(PullRequestRole.Participant)
      .subscribe(data => this.handleResponse(PullRequestRole.Participant, data.values));
  }

  readPullRequestData(role?: PullRequestRole) {
    this.authored = this.dataService.getPullRequests(PullRequestRole.Author);
    this.reviewing = this.dataService.getPullRequests(PullRequestRole.Reviewer);
    this.participant = this.dataService.getPullRequests(PullRequestRole.Participant);
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

@Injectable()
export class BackgroundService {
  timer?: number;

  constructor() {
  }

  setupWorker() {
    if (!this.timer) {
      this.timer = setInterval(this.do, 3000);
      console.log('worker set');
    } else {
      console.log('worker is running already');
    }
  }

  stopWorker() {
    clearInterval(this.timer);
    console.log('worker stopped');
  }

  do() {
    console.log('stuff...');
  }
}
