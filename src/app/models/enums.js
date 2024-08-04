export var PullRequestRole;
(function (PullRequestRole) {
    PullRequestRole["Author"] = "AUTHOR";
    PullRequestRole["Reviewer"] = "REVIEWER";
    PullRequestRole["Participant"] = "PARTICIPANT";
})(PullRequestRole || (PullRequestRole = {}));
export var PullRequestState;
(function (PullRequestState) {
    PullRequestState["Open"] = "OPEN";
    PullRequestState["Closed"] = "CLOSED";
})(PullRequestState || (PullRequestState = {}));
export var PullRequestStatus;
(function (PullRequestStatus) {
    PullRequestStatus["Approved"] = "APPROVED";
    PullRequestStatus["Unapproved"] = "UNAPPROVED";
    PullRequestStatus["NeedsWork"] = "NEEDS_WORK";
})(PullRequestStatus || (PullRequestStatus = {}));
export var PullRequestActivityAction;
(function (PullRequestActivityAction) {
    PullRequestActivityAction["Opened"] = "OPENED";
    PullRequestActivityAction["Approved"] = "APPROVED";
    PullRequestActivityAction["Updated"] = "UPDATED";
    PullRequestActivityAction["Rescoped"] = "RESCOPED";
    PullRequestActivityAction["Commented"] = "COMMENTED";
    PullRequestActivityAction["Merged"] = "MERGED";
    PullRequestActivityAction["Declined"] = "DECLINED";
    // virtual activity
    PullRequestActivityAction["Removed"] = "REMOVED";
    PullRequestActivityAction["NeedsWork"] = "NEEDS_WORK";
    PullRequestActivityAction["Conflicted"] = "CONFLICTED";
})(PullRequestActivityAction || (PullRequestActivityAction = {}));
export var BitbucketCommentAction;
(function (BitbucketCommentAction) {
    BitbucketCommentAction["Added"] = "ADDED";
})(BitbucketCommentAction || (BitbucketCommentAction = {}));
export var BitbucketMergeResultOutcome;
(function (BitbucketMergeResultOutcome) {
    BitbucketMergeResultOutcome["Conflicted"] = "CONFLICTED";
    BitbucketMergeResultOutcome["Clean"] = "CLEAN";
})(BitbucketMergeResultOutcome || (BitbucketMergeResultOutcome = {}));
//# sourceMappingURL=enums.js.map