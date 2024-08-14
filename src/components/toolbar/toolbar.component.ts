import {Component, input, output} from '@angular/core';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    DatePipe
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss'
})
export class ToolbarComponent {
  public lastDataFetchingTimestampSig = input.required<number | undefined>({alias: 'lastDataFetchingTimestamp'});
  public refreshData = output();

  protected dateFormat = 'dd MMM, y HH:mm:ss'; // todo: save to settings
}
