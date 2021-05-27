import {Component, Input, OnInit} from '@angular/core';
import {PullRequestState} from '../../models/enums';

@Component({
  selector: 'app-pull-request-state',
  templateUrl: './pull-request-state.component.html',
  styleUrls: ['./pull-request-state.component.css']
})
export class PullRequestStateComponent implements OnInit {

  @Input() state!: PullRequestState;

  constructor() {
  }

  ngOnInit(): void {
  }

}
