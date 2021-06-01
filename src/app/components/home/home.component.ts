import {Component, OnInit} from '@angular/core';
import {BitbucketService} from '../../services/bitbucket.service';
import {PullRequestRole} from '../../models/enums';
import {PullRequest} from '../../models/models';
import {NotificationService} from '../../services/notification.service';
import {DataService} from '../../services/data.service';
import {BackgroundService} from '../../services/background.service';

@Component({
  selector: 'app-main',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  authored: PullRequest[];
  reviewing: PullRequest[];
  participant: PullRequest[];

  constructor(
    private bitbucketService: BitbucketService,
    private notificationService: NotificationService,
    private dataService: DataService,
    private backgroundService: BackgroundService) {

    this.authored = [];
    this.reviewing = [];
    this.participant = [];
  }

  ngOnInit(): void {
    this.readPullRequestData(undefined);

    this.backgroundService.prResponseProcessor
      .subscribe(role => this.readPullRequestData(role));
  }

  readPullRequestData(role?: PullRequestRole) {
    this.authored = this.dataService.getPullRequests(PullRequestRole.Author);
    this.reviewing = this.dataService.getPullRequests(PullRequestRole.Reviewer);
    this.participant = this.dataService.getPullRequests(PullRequestRole.Participant);
  }
}

