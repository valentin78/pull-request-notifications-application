import {Component, OnInit} from '@angular/core';
import {BitbucketService} from '../../services/bitbucket.service';
import {PullRequestRole} from '../../models/enums';
import {BitbucketResponse, PullRequest} from '../../models/models';

@Component({
  selector: 'app-main',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  authored: BitbucketResponse<PullRequest> | undefined;
  reviewing: BitbucketResponse<PullRequest> | undefined;
  participant: BitbucketResponse<PullRequest> | undefined;

  constructor(private bitbucketService: BitbucketService) {
  }

  ngOnInit(): void {

    this.bitbucketService
      .getPullRequests(PullRequestRole.Author)
      .subscribe(data => {
        this.authored = data;
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
