export class ExtensionSettings {
    constructor(data) {
        this.bitbucket = new BitbucketSettings();
        this.refreshIntervalInMinutes = 1;
        this.notifications = new NotificationSettings();
        if (data) {
            Object.assign(this, data, {
                bitbucket: new BitbucketSettings(data.bitbucket),
                notifications: new NotificationSettings(data.notifications)
            });
        }
    }
}
export class NotificationSettings {
    constructor(data) {
        this.browser = true;
        this.events = new NotificationEvents();
        if (data) {
            Object.assign(this, data, {
                events: new NotificationEvents(data.events)
            });
        }
    }
}
export class NotificationEvents {
    constructor(data) {
        this.pullRequestCreated = true;
        this.pullRequestStateChanged = true;
        this.commentAdded = true;
        if (data) {
            Object.assign(this, data);
        }
    }
}
export class SlackSettings {
}
export class BitbucketSettings {
    constructor(data) {
        if (data) {
            Object.assign(this, data);
        }
    }
    isValid() {
        return !!(this.url && this.username && this.token);
    }
}
export class BitbucketResponse {
}
export class PullRequest {
}
export class PullRequestActivity {
}
export class BitbucketComment {
}
export class Properties {
}
export class MergeResult {
}
export class BitbucketUser {
}
export class Links {
}
export class PullRequestParticipant {
}
export class PullRequestReviewer extends PullRequestParticipant {
}
export class PullRequestAuthor extends PullRequestParticipant {
}
export class PullRequestReference {
}
export class BitbucketRepository {
}
export class BitbucketProject {
}
export class PullRequestIssue {
}
export class NotificationOptions {
}
//# sourceMappingURL=models.js.map