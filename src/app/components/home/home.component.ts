import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {BitbucketService} from '../../services/bitbucket.service';
import {PullRequestRole} from '../../models/enums';
import {PullRequest} from '../../models/models';
import {NotificationService} from '../../services/notification.service';
import {DataService} from '../../services/data.service';
import {BackgroundService} from '../../services/background.service';
import {DisposableComponent} from '../../../core/disposable-component';

@Component({
  selector: 'app-main',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent extends DisposableComponent implements OnInit {
  created: PullRequest[];
  reviewing: PullRequest[];
  participant: PullRequest[];
  isSettingsValid!: boolean;
  lastDataFetchingTimestamp?: number;
  dateFormat = 'dd MMM, y HH:mm:ss'; // todo: save to settings

  constructor(
    private bitbucketService: BitbucketService,
    private notificationService: NotificationService,
    private dataService: DataService,
    private backgroundService: BackgroundService,
    private cd: ChangeDetectorRef) {
    super();

    this.created = [];
    this.reviewing = [];
    this.participant = [];
  }

  ngOnInit(): void {

    const settings = this.dataService.getExtensionSettings();
    this.isSettingsValid = settings?.bitbucket?.isValid() || false;
    if (!this.isSettingsValid) {
      return;
    }

    this.readPullRequestData();

    // this is used only if new data were fetched during home screen preview
    this.backgroundService.dataProcessed.safeSubscribe(this, () => this.readPullRequestData());
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

  private sortPullRequests(a: PullRequest, b: PullRequest): number {
    return a.title.localeCompare(b.title);

    // const buildCompareValue = (pr: PullRequest) => `${pr.fromRef.repository.name} ${pr.fromRef.displayId}`;
    // const aValue = buildCompareValue(a);
    // const bValue = buildCompareValue(b);
    // return aValue.localeCompare(bValue);
  }

  onRefresh() {
    this.backgroundService.doWork();
  }
}

