import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {PullRequestRole} from '../../models/enums';
import {PullRequest} from '../../models/models';
import {DataService} from '../../services/data.service';
import {BackgroundService} from '../../services/background.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DatePipe} from '@angular/common';
import {PullRequestComponent} from '../pull-request-view/pull-request.component';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-main',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    DatePipe,
    PullRequestComponent,
    RouterLink
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  protected created: PullRequest[] = [];
  protected reviewing: PullRequest[] = [];
  protected participant: PullRequest[] = [];
  protected isSettingsValid!: boolean;
  protected lastDataFetchingTimestamp?: number;
  protected dateFormat = 'dd MMM, y HH:mm:ss'; // todo: save to settings

  private _dataService = inject(DataService);
  private _backgroundService = inject(BackgroundService);
  private _changeRef = inject(ChangeDetectorRef);
  private _destroyRef = inject(DestroyRef);

  async ngOnInit(): Promise<void> {
    await this._dataService.getExtensionSettings().then(async settings => {
      this.isSettingsValid = settings?.bitbucket?.isValid() || false;
      if (!this.isSettingsValid) {
        return;
      }

      await this.readPullRequestData();

      // this is used only if new data were fetched during home screen preview
      this._backgroundService.dataProcessed.pipe(
        takeUntilDestroyed(this._destroyRef)
      ).subscribe(async () => await this.readPullRequestData());
    });
  }

  private async readPullRequestData() {
    const created = await this._dataService.getPullRequests(PullRequestRole.Author);
    const reviewing = await this._dataService.getPullRequests(PullRequestRole.Reviewer);
    const participant = await this._dataService.getPullRequests(PullRequestRole.Participant);

    this.created = this.groupAndSort(created);
    this.reviewing = this.groupAndSort(reviewing);
    this.participant = this.groupAndSort(participant);

    this.lastDataFetchingTimestamp = await this._dataService.getLastDataFetchingTimestamp();

    this._changeRef.markForCheck();
  }

  private groupAndSort(requests: PullRequest[]): PullRequest[] {
    // group & sort inside group
    const groups = requests.sort(this.sortPullRequests).reduce((groups: any, pr) => {
      const key = /.*(CCM-[^\W]+).*/.exec(pr.title)?.[1] ?? '';
      if (key) pr.title = pr.title.replace(key, `<i>${key}</i>`)
      const arr = groups[key] as [] ?? [];
      groups[key] = [...arr, pr].sort(this.sortPullRequests)
      return groups;
    }, {});
    return Object.keys(groups).reduce((arr, key) => {
      arr.push(...groups[key] as []);
      return arr;
    }, []);
  }

  private sortPullRequests(a: PullRequest, b: PullRequest): number {
    return a.title.localeCompare(b.title);

    // const buildCompareValue = (pr: PullRequest) => `${pr.fromRef.repository.name} ${pr.fromRef.displayId}`;
    // const aValue = buildCompareValue(a);
    // const bValue = buildCompareValue(b);
    // return aValue.localeCompare(bValue);
  }

  protected async onRefresh() {
    await this._backgroundService.doWork();
  }
}

