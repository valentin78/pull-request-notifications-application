import {Component, Input, OnInit} from '@angular/core';
import {PullRequest} from '../../models/models';

@Component({
  selector: 'app-pull-request',
  templateUrl: './pull-request.component.html',
  styleUrls: ['./pull-request.component.css']
})
export class PullRequestComponent implements OnInit {

  @Input()
  pullRequest!: PullRequest;

  selfUrl!: string;

  constructor() {
  }

  ngOnInit(): void {
    if (this.pullRequest.links.self.length > 0) {
      this.selfUrl = this.pullRequest.links.self[0].href;
    }
  }
}
