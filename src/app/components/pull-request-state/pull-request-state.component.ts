import {Component, Input} from '@angular/core';
import {PullRequestState} from '../../models/enums';

@Component({
  selector: 'app-pull-request-state',
  standalone: true,
  templateUrl: './pull-request-state.component.html',
  styleUrls: ['./pull-request-state.component.scss']
})
export class PullRequestStateComponent {
  @Input() state!: PullRequestState;
}
