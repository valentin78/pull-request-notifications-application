import {Component, Input, OnInit} from '@angular/core';
import {DataService} from '../../services/data.service';

@Component({
  selector: 'app-snooze-notification',
  templateUrl: './snooze-notification.component.html',
  styleUrls: ['./snooze-notification.component.scss']
})
export class SnoozeNotificationComponent implements OnInit {

  snoozed!: boolean;
  @Input() id!: number;

  constructor(private dataService: DataService) {
  }

  ngOnInit(): void {
    let settings = this.dataService.getNotificationSnoozeSettings();
    this.snoozed = settings.includes(this.id);
  }

  onSnoozeToggle() {
    // todo: add snooze ttl 1/2/3/5/8 hours or disable
    let settings = this.dataService.getNotificationSnoozeSettings();
    if (this.snoozed) {
      this.dataService.saveNotificationSnoozeSettings(settings.filter(id => id !== this.id));
      this.snoozed = false;
    } else {
      settings.push(this.id);
      this.dataService.saveNotificationSnoozeSettings(settings);
      this.snoozed = true;
    }
  }

}
