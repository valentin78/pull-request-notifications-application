import {Component, inject, Input, OnInit} from '@angular/core';
import {BitbucketComment, PullRequest} from '../../models/models';
import {BitbucketMergeResultOutcome, PullRequestStatus} from '../../models/enums';
import {ApplicationService} from '../../services/application.service';
import {UserComponent} from '../user/user.component';
import {DatePipe, NgClass} from '@angular/common';
import {SnoozeNotificationComponent} from '../snooze-notification/snooze-notification.component';

@Component({
  selector: 'app-pull-request',
  standalone: true,
  templateUrl: './pull-request.component.html',
  imports: [
    UserComponent,
    NgClass,
    DatePipe,
    SnoozeNotificationComponent
  ],
  styleUrls: ['./pull-request.component.scss']
})
export class PullRequestComponent implements OnInit {
  @Input() pullRequest!: PullRequest;
  @Input() showAuthorAvatar: boolean = true;

  private _applicationService = inject(ApplicationService);

  selfUrl!: string;
  approved!: boolean;
  needsWork!: boolean;
  hasConflicts!: boolean;
  status!: string;
  commentsCount!: number;
  commentsTooltip?: string;

  ngOnInit(): void {
    if (this.pullRequest.links.self.length > 0) {
      this.selfUrl = this.pullRequest.links.self[0].href;
    }

    this.needsWork = this.pullRequest.reviewers.some(r => r.status === PullRequestStatus.NeedsWork);
    this.approved = !this.needsWork && this.pullRequest.reviewers.some(r => r.status === PullRequestStatus.Approved);
    this.hasConflicts = this.pullRequest.properties.mergeResult?.outcome === BitbucketMergeResultOutcome.Conflicted;

    this.status = this.needsWork && 'NEEDS WORK'
      || this.hasConflicts && 'CONFLICTS'
      || this.approved && 'APPROVED'
      || 'OPEN';

    this.commentsCount = this.pullRequest.properties.commentCount || 0;
    this.commentsTooltip = this.buildTooltip();
  }

  navigateTo(url: string) {
    this._applicationService.navigateTo(url)
  }

  onDisplayComments(_: MouseEvent) {
    console.log('comments', this.pullRequest.comments);
  }

  private buildTooltip(): string {

    let tooltip = `${this.commentsCount} comments`;

    if (this.pullRequest.comments?.length) {
      tooltip += '\n';
      const comments = this.pullRequest.comments.map(c => c.comment!);
      tooltip = this.iterateThroughComments(tooltip, comments, 1);
    }

    return tooltip;
  }

  private iterateThroughComments(tooltip: string, comments: BitbucketComment[], nestLevel: number): string {
    const tabs = new Array(nestLevel).join('\t');
    nestLevel++;

    comments.forEach((value, index) => {
      const cmt = value;
      tooltip += `${tabs}#${index + 1} ${cmt?.author?.name ?? '<author>'}: ${cmt?.text?.trim()}\n`;

      if (cmt?.comments?.length) {
        tooltip = this.iterateThroughComments(tooltip, cmt.comments, nestLevel);
      }
    });

    tooltip += '\n';
    return tooltip;
  }
}
