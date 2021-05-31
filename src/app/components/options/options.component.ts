import {Component, OnInit} from '@angular/core';
import {ExtensionSettings} from '../../models/models';
import {DataService} from '../../services/data.service';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
})
export class OptionsComponent implements OnInit {

  settings: ExtensionSettings;
  statusMessage?: string;

  constructor(private settingsService: DataService) {
    this.settings = settingsService.getExtensionSettings();
  }

  ngOnInit(): void {
  }

  onSave() {
    this.settingsService.saveExtensionSettings(this.settings);

    this.statusMessage = 'saved!';
    setTimeout(() => {
      this.statusMessage = undefined;
    }, 3000);
  }
}

