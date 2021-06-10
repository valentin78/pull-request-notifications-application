import {Component, Input, OnInit} from '@angular/core';
import {PullRequest} from '../../models/models';

@Component({
  selector: 'app-pull-request',
  templateUrl: './pull-request.component.html',
  styleUrls: ['./pull-request.component.scss']
})
export class PullRequestComponent implements OnInit {

  @Input() pullRequest!: PullRequest;
  @Input() showAuthorAvatar: boolean = true;

  selfUrl!: string;
  canBeMerged!: boolean;
  hasConflicts!: boolean;
  commentsCount!: number;

  constructor() {
  }

  ngOnInit(): void {
    if (this.pullRequest.links.self.length > 0) {
      this.selfUrl = this.pullRequest.links.self[0].href;
    }

    // this.canBeMerged = this.pullRequest.reviewers.some(r => r.approved);
    this.hasConflicts = this.pullRequest.properties.mergeResult.outcome !== 'CLEAN';

    this.commentsCount = this.pullRequest.properties.commentCount || 0;
  }

  navigateTo(url: string) {
    window.open(url);
  }
}
