import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {PullRequestRole} from '../../models/enums';
import {PullRequest} from '../../models/models';
import {DataService} from '../../services/data.service';
import {BackgroundService} from '../../services/background.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DatePipe, NgClass, NgTemplateOutlet} from '@angular/common';
import {PullRequestComponent} from '../pull-request-view/pull-request.component';
import {RouterLink} from '@angular/router';
import {ToKeyValuePipe} from '../../pipes/to-key-value.pipe';
import {ApplicationService} from '../../services/application.service';
import {ToolbarComponent} from '../toolbar/toolbar.component';

type PullRequestGroups = Record<string, PullRequest[]>;

@Component({
  selector: 'app-main',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    DatePipe,
    PullRequestComponent,
    RouterLink,
    ToKeyValuePipe,
    NgClass,
    NgTemplateOutlet,
    ToolbarComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  protected created: PullRequestGroups = {};
  protected reviewing: PullRequestGroups = {};
  protected participant: PullRequestGroups = {};
  protected isSettingsValid!: boolean;
  protected lastDataFetchingTimestamp?: number;

  private _groupByRegex!: string | null;
  protected taskLinkPattern!: string | null;

  private _dataService = inject(DataService);
  private _backgroundService = inject(BackgroundService);
  private _changeRef = inject(ChangeDetectorRef);
  private _destroyRef = inject(DestroyRef);
  private _applicationService = inject(ApplicationService);

  async ngOnInit(): Promise<void> {
    await this._dataService.getExtensionSettings().then(async settings => {
      this._groupByRegex = settings.groupByRegex;
      this.taskLinkPattern = settings.taskLinkPattern;

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

  protected totalPullRequests(group: PullRequestGroups): number {
    return Object.keys(group).reduce((result, key) => {
      return result + group[key].length;
    }, 0);
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

  private groupAndSort(requests: PullRequest[]): PullRequestGroups {
    // group & sort inside group
    return requests
      .sort(this.sortPullRequests)
      .reduce((groups: any, pr) => {
        const key = this._groupByRegex
          ? new RegExp(this._groupByRegex).exec(pr.title)?.[1] ?? ''
          : '';
        if (key) {
          pr.title = pr.title.replace(key, `<i>${key}</i>`)
        }
        const arr = groups[key] as [] ?? [];
        groups[key] = [...arr, pr];
        return groups;
      }, {});
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

  protected groupClick(groupKey: string) {
    if (!this.taskLinkPattern) throw new Error(`taskLinkPattern cannot be null or undefined`);
    const link: string = this.taskLinkPattern.replace('$1', groupKey);
    this._applicationService.navigateTo(link);
  }
}

