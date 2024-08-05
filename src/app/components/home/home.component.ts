import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {PullRequestRole} from '../../models/enums';
import {PullRequest} from '../../models/models';
import {DataService} from '../../services/data.service';
import {BackgroundService} from '../../services/background.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-main',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  created: PullRequest[];
  reviewing: PullRequest[];
  participant: PullRequest[];
  isSettingsValid!: boolean;
  lastDataFetchingTimestamp?: number;
  dateFormat = 'dd MMM, y HH:mm:ss'; // todo: save to settings

  private dataService = inject(DataService);
  private backgroundService = inject(BackgroundService);
  private cd = inject(ChangeDetectorRef);
  private _destroyRef = inject(DestroyRef);

  constructor() {
    this.created = [];
    this.reviewing = [];
    this.participant = [];
  }

  async ngOnInit(): Promise<void> {
    await this.dataService.getExtensionSettings().then(async settings => {
      this.isSettingsValid = settings?.bitbucket?.isValid() || false;
      if (!this.isSettingsValid) {
        return;
      }

      await this.readPullRequestData();

      // this is used only if new data were fetched during home screen preview
      this.backgroundService.dataProcessed.pipe(
        takeUntilDestroyed(this._destroyRef)
      ).subscribe(async () => await this.readPullRequestData());
    });
  }

  async readPullRequestData() {
    const created = await this.dataService.getPullRequests(PullRequestRole.Author);
    const reviewing = await this.dataService.getPullRequests(PullRequestRole.Reviewer);
    const participant = await this.dataService.getPullRequests(PullRequestRole.Participant);

    console.log('!!!!', created);

    this.created = created.sort(this.sortPullRequests);
    this.reviewing = reviewing.sort(this.sortPullRequests);
    this.participant = participant.sort(this.sortPullRequests);
    this.lastDataFetchingTimestamp = await this.dataService.getLastDataFetchingTimestamp();

    this.cd.markForCheck();
  }

  private sortPullRequests(a: PullRequest, b: PullRequest): number {
    return a.title.localeCompare(b.title);

    // const buildCompareValue = (pr: PullRequest) => `${pr.fromRef.repository.name} ${pr.fromRef.displayId}`;
    // const aValue = buildCompareValue(a);
    // const bValue = buildCompareValue(b);
    // return aValue.localeCompare(bValue);
  }

  async onRefresh() {
    await this.backgroundService.doWork();
  }
}

