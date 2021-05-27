import {Component, OnInit} from '@angular/core';
import {BitbucketSettings} from '../../models/bitbucketSettings';
import {SettingsService} from '../../services/settings.service';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.css']
})
export class OptionsComponent implements OnInit {

  settings: BitbucketSettings;

  constructor(private settingsService: SettingsService) {
    this.settings = settingsService.getBitbucketSettings();
  }

  ngOnInit(): void {
  }

  onSave(){
    this.settingsService.saveBitbucketSettings(this.settings);
  }
}

