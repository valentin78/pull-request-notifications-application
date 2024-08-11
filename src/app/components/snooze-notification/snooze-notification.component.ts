import {Component, inject, Input, OnInit} from '@angular/core';
import {DataService} from '../../services/data.service';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-snooze-notification',
  standalone: true,
  templateUrl: './snooze-notification.component.html',
  imports: [
    NgClass
  ],
  styleUrls: ['./snooze-notification.component.scss']
})
export class SnoozeNotificationComponent implements OnInit {
  @Input() id!: number;

  private dataService = inject(DataService)

  protected snoozed!: boolean;

  async ngOnInit(): Promise<void> {
    let settings = await this.dataService.getNotificationSnoozeSettings();
    this.snoozed = settings.includes(this.id);
  }

  async onSnoozeToggle() {
    // todo: add snooze ttl 1/2/3/5/8 hours or disable
    let settings = await this.dataService.getNotificationSnoozeSettings();
    if (this.snoozed) {
      await this.dataService.saveNotificationSnoozeSettings(settings.filter(id => id !== this.id));
      this.snoozed = false;
    } else {
      settings.push(this.id);
      await this.dataService.saveNotificationSnoozeSettings(settings);
      this.snoozed = true;
    }
  }
}
