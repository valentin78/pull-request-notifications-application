import { __decorate } from "tslib";
import { Component, Input } from '@angular/core';
import { BitbucketMergeResultOutcome, PullRequestStatus } from '../../models/enums';
let PullRequestComponent = class PullRequestComponent {
    constructor() {
        this.showAuthorAvatar = true;
    }
    ngOnInit() {
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
    navigateTo(url) {
        window.open(url);
    }
    onDisplayComments(_) {
        console.log('comments', this.pullRequest.comments);
    }
    buildTooltip() {
        let tooltip = `${this.commentsCount} comments`;
        if (this.pullRequest.comments?.length) {
            tooltip += '\n';
            const comments = this.pullRequest.comments.map(c => c.comment);
            tooltip = this.iterateThroughComments(tooltip, comments, 1);
        }
        return tooltip;
    }
    iterateThroughComments(tooltip, comments, nestLevel) {
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
};
__decorate([
    Input()
], PullRequestComponent.prototype, "pullRequest", void 0);
__decorate([
    Input()
], PullRequestComponent.prototype, "showAuthorAvatar", void 0);
PullRequestComponent = __decorate([
    Component({
        selector: 'app-pull-request',
        templateUrl: './pull-request.component.html',
        styleUrls: ['./pull-request.component.scss']
    })
], PullRequestComponent);
export { PullRequestComponent };
//# sourceMappingURL=pull-request.component.js.map