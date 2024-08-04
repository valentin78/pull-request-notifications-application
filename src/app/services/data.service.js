import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { ExtensionSettings } from '../models/models';
let DataService = class DataService {
    constructor() {
        this.keys = {
            settings: 'pull-request-notifications.settings',
            lastRunningTime: 'pull-request-notifications.last-running-time',
            snoozeSettings: 'pull-request-notifications.snooze-settings',
            pullRequests: 'pull-request-notifications.pull-requests'
        };
    }
    getExtensionSettings() {
        let settings = JSON.parse(localStorage.getItem(this.keys.settings));
        return new ExtensionSettings(settings);
    }
    saveExtensionSettings(settings) {
        localStorage.setItem(this.keys.settings, JSON.stringify(settings));
    }
    getPullRequests(role) {
        return JSON.parse(localStorage.getItem(`${this.keys.pullRequests}.${role}`)) || [];
    }
    savePullRequests(role, values) {
        localStorage.setItem(`${this.keys.pullRequests}.${role}`, JSON.stringify(values));
    }
    getLastDataFetchingTimestamp() {
        // return now - 1h, if last running time is not available
        return JSON.parse(localStorage.getItem(this.keys.lastRunningTime)) || (Date.now() - 60 * 60 * 1000);
    }
    saveLastDataFetchingTimestamp(timestamp) {
        return localStorage.setItem(this.keys.lastRunningTime, JSON.stringify(timestamp));
    }
    getNotificationSnoozeSettings() {
        return JSON.parse(localStorage.getItem(this.keys.snoozeSettings)) || [];
    }
    saveNotificationSnoozeSettings(settings) {
        return localStorage.setItem(this.keys.snoozeSettings, JSON.stringify(settings));
    }
};
DataService = __decorate([
    Injectable()
], DataService);
export { DataService };
//# sourceMappingURL=data.service.js.map