import {Component, Input, OnInit} from '@angular/core';
import {PullRequest} from '../../services/bitbucket.service';

@Component({
  selector: 'app-pull-request',
  templateUrl: './pull-request.component.html',
  styleUrls: ['./pull-request.component.css']
})
export class PullRequestComponent implements OnInit {

  @Input() pullRequest: PullRequest | undefined;

  constructor() {
  }

  ngOnInit(): void {
  }

}
