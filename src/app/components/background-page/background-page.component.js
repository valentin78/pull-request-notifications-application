import { __decorate } from "tslib";
import { Component } from '@angular/core';
let BackgroundPageComponent = class BackgroundPageComponent {
    constructor(service) {
        this.service = service;
    }
    ngOnInit() {
        this.service.setupAlarms();
    }
};
BackgroundPageComponent = __decorate([
    Component({
        selector: 'app-background-service',
        templateUrl: './background-page.component.html',
        styleUrls: ['./background-page.component.css']
    })
], BackgroundPageComponent);
export { BackgroundPageComponent };
//# sourceMappingURL=background-page.component.js.map