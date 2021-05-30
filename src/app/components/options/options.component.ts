import {Component, OnInit} from '@angular/core';
import {BitbucketSettings} from '../../models/models';
import {DataService} from '../../services/data.service';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
})
export class OptionsComponent implements OnInit {

  settings: BitbucketSettings;
  statusMessage?: string;

  constructor(private settingsService: DataService) {
    this.settings = settingsService.getBitbucketSettings();
  }

  ngOnInit(): void {
  }

  onSave() {
    this.settingsService.saveBitbucketSettings(this.settings);

    this.statusMessage = 'saved!';
    setTimeout(() => {
      this.statusMessage = undefined;
    }, 3000);
  }
}

