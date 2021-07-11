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
    this.backgroundService.dataProcessed$.safeSubscribe(this, () => this.readPullRequestData());
  }

  readPullRequestData() {
    this.created = this.dataService.getPullRequests(PullRequestRole.Author);
    this.reviewing = this.dataService.getPullRequests(PullRequestRole.Reviewer);
    this.participant = this.dataService.getPullRequests(PullRequestRole.Participant);

    this.cd.markForCheck();
  }

  onRefresh() {
    this.backgroundService.doWork();
  }
}

