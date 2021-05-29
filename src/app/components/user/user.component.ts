import {Component, Input, OnInit} from '@angular/core';
import {BitbucketUser} from '../../models/models';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  @Input() user!: BitbucketUser;
  @Input() approved?: boolean;
  @Input() size: number = 30;

  title!: string;
  avatar!: string;

  constructor() {
  }

  ngOnInit(): void {
    if (this.user.links?.self) {
      this.avatar = `${this.user.links.self[0].href}/avatar.png`;
    }

    this.title = this.user.displayName;
  }

}
