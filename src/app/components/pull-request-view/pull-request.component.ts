import {Component, Input, OnInit} from '@angular/core';
import {PullRequest} from '../../models/models';
import {BitbucketMergeResultOutcome, PullRequestStatus} from '../../models/enums';

@Component({
  selector: 'app-pull-request',
  templateUrl: './pull-request.component.html',
  styleUrls: ['./pull-request.component.scss']
})
export class PullRequestComponent implements OnInit {

  @Input() pullRequest!: PullRequest;
  @Input() showAuthorAvatar: boolean = true;

  selfUrl!: string;
  approved!: boolean;
  needsWork!: boolean;
  hasConflicts!: boolean;
  status!: string;
  commentsCount!: number;

  constructor() {
  }

  ngOnInit(): void {
    if (this.pullRequest.links.self.length > 0) {
      this.selfUrl = this.pullRequest.links.self[0].href;
    }

    this.needsWork = this.pullRequest.reviewers.some(r => r.status === PullRequestStatus.NeedsWork);
    this.approved = !this.needsWork && this.pullRequest.reviewers.some(r => r.status === PullRequestStatus.Approved);
    this.hasConflicts = this.pullRequest.properties.mergeResult.outcome === BitbucketMergeResultOutcome.Conflicted;

    this.status = this.needsWork && 'NEEDS WORK'
      || this.hasConflicts && 'HAS CONFLICTS'
      || this.approved && 'APPROVED'
      || 'OPEN';

    this.commentsCount = this.pullRequest.properties.commentCount || 0;
  }

  navigateTo(url: string) {
    window.open(url);
  }
}
