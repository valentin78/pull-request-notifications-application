import { __decorate } from "tslib";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { PullRequestRole } from '../../models/enums';
import { DataService } from '../../services/data.service';
import { BackgroundService } from '../../services/background.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
let HomeComponent = class HomeComponent {
    constructor() {
        this.dateFormat = 'dd MMM, y HH:mm:ss'; // todo: save to settings
        this.dataService = inject(DataService);
        this.backgroundService = inject(BackgroundService);
        this.cd = inject(ChangeDetectorRef);
        this._destroyRef = inject(DestroyRef);
        this.created = [];
        this.reviewing = [];
        this.participant = [];
    }
    ngOnInit() {
        const settings = this.dataService.getExtensionSettings();
        this.isSettingsValid = settings?.bitbucket?.isValid() || false;
        if (!this.isSettingsValid) {
            return;
        }
        this.readPullRequestData();
        // this is used only if new data were fetched during home screen preview
        this.backgroundService.dataProcessed
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe(() => this.readPullRequestData());
    }
    readPullRequestData() {
        const created = this.dataService.getPullRequests(PullRequestRole.Author);
        const reviewing = this.dataService.getPullRequests(PullRequestRole.Reviewer);
        const participant = this.dataService.getPullRequests(PullRequestRole.Participant);
        this.created = created.sort(this.sortPullRequests);
        this.reviewing = reviewing.sort(this.sortPullRequests);
        this.participant = participant.sort(this.sortPullRequests);
        this.lastDataFetchingTimestamp = this.dataService.getLastDataFetchingTimestamp();
        this.cd.markForCheck();
    }
    sortPullRequests(a, b) {
        return a.title.localeCompare(b.title);
        // const buildCompareValue = (pr: PullRequest) => `${pr.fromRef.repository.name} ${pr.fromRef.displayId}`;
        // const aValue = buildCompareValue(a);
        // const bValue = buildCompareValue(b);
        // return aValue.localeCompare(bValue);
    }
    onRefresh() {
        this.backgroundService.doWork();
    }
};
HomeComponent = __decorate([
    Component({
        selector: 'app-main',
        templateUrl: './home.component.html',
        styleUrls: ['./home.component.scss'],
        changeDetection: ChangeDetectionStrategy.OnPush
    })
], HomeComponent);
export { HomeComponent };
//# sourceMappingURL=home.component.js.map