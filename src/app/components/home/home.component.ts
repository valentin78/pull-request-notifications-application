import {Component, EventEmitter, OnInit} from '@angular/core';
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
  authored: PullRequest[] | undefined;
  reviewing: PullRequest[] | undefined;
  participant: PullRequest[] | undefined;

  eventEmitter!: EventEmitter<{ role: PullRequestRole, values: PullRequest[] }>;

  constructor(
    private bitbucketService: BitbucketService,
    private notificationService: NotificationService,
    private dataService: DataService) {
    this.eventEmitter = new EventEmitter<{ role: PullRequestRole; values: PullRequest[] }>(true);
  }

  ngOnInit(): void {
    this.eventEmitter
      .subscribe(data => this.handleResponse(data.role, data.values));

    this.bitbucketService
      .getPullRequests(PullRequestRole.Author)
      .subscribe(data => this.eventEmitter.next({role: PullRequestRole.Author, values: data.values}));

    this.bitbucketService
      .getPullRequests(PullRequestRole.Reviewer)
      .subscribe(data => this.eventEmitter.next({role: PullRequestRole.Reviewer, values: data.values}));

    this.bitbucketService
      .getPullRequests(PullRequestRole.Participant)
      .subscribe(data => this.eventEmitter.next({role: PullRequestRole.Participant, values: data.values}));
  }

  handleResponse(role: PullRequestRole, values: PullRequest[]) {
    const before = this.dataService.getPullRequests(role);

    switch (role) {
      case PullRequestRole.Author:
        this.authored = values;

        //todo: compare with previous values and decide what notification to display

        break;
      case PullRequestRole.Reviewer:
        this.reviewing = values;
        break;
      case PullRequestRole.Participant:
        this.participant = values;
        break;
    }

    this.dataService.savePullRequests(role, values);
  }
}

