import { __decorate } from "tslib";
import { Component, Input } from '@angular/core';
let SnoozeNotificationComponent = class SnoozeNotificationComponent {
    constructor(dataService) {
        this.dataService = dataService;
    }
    ngOnInit() {
        let settings = this.dataService.getNotificationSnoozeSettings();
        this.snoozed = settings.includes(this.id);
    }
    onSnoozeToggle() {
        // todo: add snooze ttl 1/2/3/5/8 hours or disable
        let settings = this.dataService.getNotificationSnoozeSettings();
        if (this.snoozed) {
            this.dataService.saveNotificationSnoozeSettings(settings.filter(id => id !== this.id));
            this.snoozed = false;
        }
        else {
            settings.push(this.id);
            this.dataService.saveNotificationSnoozeSettings(settings);
            this.snoozed = true;
        }
    }
};
__decorate([
    Input()
], SnoozeNotificationComponent.prototype, "id", void 0);
SnoozeNotificationComponent = __decorate([
    Component({
        selector: 'app-snooze-notification',
        templateUrl: './snooze-notification.component.html',
        styleUrls: ['./snooze-notification.component.scss']
    })
], SnoozeNotificationComponent);
export { SnoozeNotificationComponent };
//# sourceMappingURL=snooze-notification.component.js.map