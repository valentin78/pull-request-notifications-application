import {Component, Input, OnInit} from '@angular/core';
import {BitbucketUser} from '../../models/models';
import {PullRequestStatus} from '../../models/enums';
import {NgOptimizedImage, NgStyle} from '@angular/common';

@Component({
  selector: 'app-user',
  standalone: true,
  templateUrl: './user.component.html',
  imports: [
    NgStyle,
    NgOptimizedImage
  ],
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  @Input() user!: BitbucketUser;
  @Input() status?: PullRequestStatus;
  @Input() size: number = 30;

  title!: string;
  avatar!: string;

  get approved(): boolean {
    return this.status === PullRequestStatus.Approved;
  }

  get needsWork(): boolean {
    return this.status === PullRequestStatus.NeedsWork;
  }

  constructor() {
  }

  ngOnInit(): void {
    if (this.user.links?.self) {
      this.avatar = `${this.user.links.self[0].href}/avatar.png`;
    }

    this.title = this.user.displayName;
  }

}
