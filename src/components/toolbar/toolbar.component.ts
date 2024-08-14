import {Component, inject, input, output} from '@angular/core';
import {DatePipe, NgOptimizedImage} from '@angular/common';
import {ApplicationService} from '../../services/application.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    DatePipe,
    NgOptimizedImage
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss'
})
export class ToolbarComponent {
  public lastDataFetchingTimestampSig = input.required<number | undefined>({alias: 'lastDataFetchingTimestamp'});
  public refreshData = output();

  private _applicationService = inject(ApplicationService)
  private _router = inject(Router)

  protected dateFormat = 'dd MMM, y HH:mm:ss'; // todo: save to settings

  protected openDevTools() {
    this._applicationService.openDevTools();
  }

  public openProject() {
    this._applicationService.openProject();
  }

  protected async openConfig() {
    await this._router.navigate(['/options']);
  }
}
