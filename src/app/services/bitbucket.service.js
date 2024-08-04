import { __decorate } from "tslib";
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from './data.service';
import { map } from 'rxjs/operators';
let BitbucketService = class BitbucketService {
    constructor() {
        this.http = inject(HttpClient);
        this.dataService = inject(DataService);
    }
    get settings() {
        return this.dataService.getExtensionSettings();
    }
    get headers() {
        return { 'Authorization': `Bearer + ${this.settings.bitbucket?.token}` };
    }
    validateCredentials(url, token, userSlug) {
        return this.http.get(`${url}/rest/api/latest/users/${userSlug}`, { headers: { 'Authorisation': `Bearer + ${token}` } })
            .pipe(map((data) => data));
    }
    getPullRequests(role) {
        // normally participant shouldn't be assigned to more than 50 PRs
        // todo: https://bitbucket.teamvelocityonline.com/rest/api/latest/dashboard/pull-requests?limit=50&state=OPEN
        return this.http.get(`${this.settings.bitbucket?.url}/rest/api/latest/inbox/pull-requests?role=${role}&limit=50`, { headers: this.headers })
            .pipe(map((data) => data));
    }
    getAllPullRequests(state) {
        return this.http.get(`${this.settings.bitbucket?.url}/rest/api/latest/dashboard/pull-requests?state=${state}&limit=100`, { headers: this.headers })
            .pipe(map((data) => data));
    }
    getPullRequestActivities(projectKey, repositorySlug, pullRequestId) {
        return this.http
            .get(`${this.settings.bitbucket?.url}/rest/api/latest/projects/${projectKey}/repos/${repositorySlug}/pull-requests/${pullRequestId}/activities?limit=100`, { headers: this.headers })
            .pipe(map(data => data));
    }
    getPullRequestIssues(projectKey, repositorySlug, pullRequestId) {
        return this.http
            .get(`${this.settings.bitbucket?.url}/rest/jira/latest/projects/${projectKey}/repos/${repositorySlug}/pull-requests/${pullRequestId}/issues?limit=100`, { headers: this.headers }).pipe(map(data => data));
    }
};
BitbucketService = __decorate([
    Injectable()
], BitbucketService);
export { BitbucketService };
//# sourceMappingURL=bitbucket.service.js.map