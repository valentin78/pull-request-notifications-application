import {Component, OnInit} from '@angular/core';
import {BackgroundService} from '../../services/background.service';
// @ts-ignore
import Alarm = chrome.alarms.Alarm;
import {DataService} from '../../services/data.service';

// @ts-ignore
let chr: any = chrome;

@Component({
  selector: 'app-background-service',
  templateUrl: './background-page.component.html',
  styleUrls: ['./background-page.component.css']
})
export class BackgroundPageComponent implements OnInit {

  constructor(private service: BackgroundService, private dataService: DataService) {
  }

  ngOnInit(): void {
    chr.alarms.clearAll((wasCleared: boolean) => {
      if (wasCleared) {
        console.debug('alarms cleared');
      }

      if (chr.alarms.onAlarm.hasListeners()) {
        console.error('alarm listener is already defined');
        this.showError('alarm listener is already defined');
      } else {
        chr.alarms.create({periodInMinutes: 1});
        console.debug('alarm created');

        this.addAlarmListener();

        if (chr.alarms.onAlarm.hasListeners()) {
          console.debug('alarm listener has been added');
        } else {
          console.error('alarm listener was not added');
          this.showError('alarm listener was not added');
        }
      }
    });
  }

  addAlarmListener() {
    chr.alarms.onAlarm.addListener((alarm: Alarm) => {
      this.service.doWork();

      const settings = this.dataService.getExtensionSettings();
      const newInterval = settings.refreshIntervalInMinutes;
      if (settings.refreshIntervalInMinutes !== alarm.periodInMinutes) {
        console.log(`interval changed from ${alarm.periodInMinutes} to ${newInterval}, restarting alarm...`);

        chr.alarms.create({periodInMinutes: settings.refreshIntervalInMinutes});
        console.debug('alarm created');
      }
    });
  }

  showError(message: string) {
    chr.browserAction.setBadgeBackgroundColor({color: 'red'});
    chr.browserAction.setBadgeText({text: message});
  }
}
