import { __decorate } from "tslib";
import { BitbucketSettings, SlackSettings } from '../../models/models';
import { forkJoin, of, Subject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Component, DestroyRef, inject } from '@angular/core';
import { SLACK_API_URL, SlackClient } from '../../services/slackClient';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
class StatusMessage {
}
let OptionsComponent = class OptionsComponent {
    constructor(settingsService, bitbucketService, backgroundService, notificationService, cd) {
        this.settingsService = settingsService;
        this.bitbucketService = bitbucketService;
        this.backgroundService = backgroundService;
        this.notificationService = notificationService;
        this.cd = cd;
        this._destroyRef = inject(DestroyRef);
        this.settings = settingsService.getExtensionSettings();
        this.enableBrowserNotifications = this.settings.notifications.browser;
        this.enableSlackNotifications = !!this.settings.notifications.slack;
        this.slackSettings = this.settings.notifications.slack || new SlackSettings();
        this.bitbucketSettings = this.settings.bitbucket || new BitbucketSettings();
        this.statusMessage$ = new Subject();
    }
    ngOnInit() {
        this.statusMessage$
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe(msg => this.showStatusMessage(msg));
    }
    onSave() {
        this.requestPermissions((granted) => {
            if (granted) {
                this.saveSettings();
            }
            else {
                this.statusMessage$.next({ message: 'permissions not allowed', type: 'error' });
            }
        });
    }
    onSlackTest() {
        let slackClient = new SlackClient(this.slackSettings.token);
        chrome.permissions.request({ origins: [`${SLACK_API_URL}/*`] }, (granted) => {
            if (granted) {
                slackClient
                    .postMessage({
                    'channel': this.slackSettings.memberId,
                    'text': 'hello'
                })
                    .pipe(takeUntilDestroyed(this._destroyRef))
                    .subscribe((data) => {
                    if (!data.ok) {
                        this.statusMessage$.next({ type: 'error', message: data.error || 'wrong slack credentials' });
                    }
                    else {
                        this.statusMessage$.next({ message: 'message sent' });
                    }
                });
            }
            else {
                this.statusMessage$.next({ message: 'permissions not allowed', type: 'error' });
            }
        });
    }
    showStatusMessage(msg) {
        console.debug('status message:', msg);
        this.statusMessage = msg;
        this.cd.detectChanges();
        if (msg.hideAfter || 5000 > 0) {
            setTimeout(() => {
                this.statusMessage = undefined;
                this.cd.detectChanges();
            }, msg.hideAfter || 5000);
        }
    }
    // validate & save settings to local storage
    saveSettings() {
        this.statusMessage$.next({ message: 'saving...', hideAfter: 0 });
        const bitbucketPromise = this.bitbucketService
            .validateCredentials(this.bitbucketSettings.url, this.bitbucketSettings.token, this.bitbucketSettings.username)
            .pipe(catchError((error, _) => {
            this.statusMessage$.next({ type: 'error', message: 'wrong bitbucket credentials' });
            return throwError(error);
        }));
        let slackClient = new SlackClient();
        const slackPromise = this.enableSlackNotifications
            ? slackClient
                .testAuth(this.slackSettings.token)
                .pipe(tap((data) => {
                if (!data.ok) {
                    throw 'wrong slack credentials';
                }
            }), catchError((error, _) => {
                this.statusMessage$.next({ type: 'error', message: 'wrong slack credentials' });
                return throwError(error);
            }))
            : of(null);
        forkJoin([bitbucketPromise, slackPromise])
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe(_ => {
            this.settings.bitbucket = this.bitbucketSettings;
            this.settings.bitbucket.userId = _[0].id;
            this.settings.notifications.slack = this.enableSlackNotifications
                ? this.slackSettings
                : undefined;
            this.settingsService.saveExtensionSettings(this.settings);
            // fetch data
            this.backgroundService.doWork();
            this.statusMessage$.next({ message: 'saved!' });
        });
    }
    // request permission to access bitbucket & slack hosts
    requestPermissions(callback) {
        let origins = [];
        const bbHost = `${new URL(this.bitbucketSettings.url || '').origin}/*`;
        origins.push(bbHost);
        if (this.enableSlackNotifications) {
            origins.push(`${SLACK_API_URL}/*`);
        }
        chrome.permissions.request({ origins: origins }, (d) => callback(d));
    }
    onEnableBrowserNotifications(event) {
        if (!this.enableBrowserNotifications) {
            this.notificationService
                .requestPermission()
                .subscribe(permission => {
                console.debug('permission:', permission);
                if (permission === 'granted') {
                    this.settings.notifications.browser = true;
                }
                else {
                    this.enableBrowserNotifications = false;
                    this.settings.notifications.browser = false;
                }
            });
        }
        else {
            this.settings.notifications.browser = false;
        }
    }
    onBrowserNotificationTest() {
        this.notificationService.sendBrowserNotification('test', 'hello', 'https://www.mozilla.org');
    }
};
OptionsComponent = __decorate([
    Component({
        selector: 'app-options',
        templateUrl: './options.component.html',
        styleUrls: ['./options.component.scss']
    })
], OptionsComponent);
export { OptionsComponent };
//# sourceMappingURL=options.component.js.map