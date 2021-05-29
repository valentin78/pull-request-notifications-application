import {Component, OnInit} from '@angular/core';
import {BitbucketService} from '../../services/bitbucket.service';
import {PullRequestRole} from '../../models/enums';
import {BitbucketResponse, PullRequest} from '../../models/models';
import {NotificationService} from '../../services/notification.service';

@Component({
  selector: 'app-main',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  authored: BitbucketResponse<PullRequest> | undefined;
  reviewing: BitbucketResponse<PullRequest> | undefined;
  participant: BitbucketResponse<PullRequest> | undefined;

  constructor(
    private bitbucketService: BitbucketService,
    private notificationService: NotificationService) {
  }

  ngOnInit(): void {

    this.bitbucketService
      .getPullRequests(PullRequestRole.Author)
      .subscribe(data => {
        this.authored = data;
        // this.notificationService.sendNotification(
        //   'title',
        //   {
        //     body: 'test',
        //     badge: undefined,
        //     icon: undefined,
        //     image: undefined,
        //     // dir: 'rtl',
        //     tag: undefined
        //   }
        // );
      });

    this.bitbucketService
      .getPullRequests(PullRequestRole.Reviewer)
      .subscribe(data => {
        this.reviewing = data;
      });

    this.bitbucketService
      .getPullRequests(PullRequestRole.Participant)
      .subscribe(data => {
        this.participant = data;
      });
  }
}

