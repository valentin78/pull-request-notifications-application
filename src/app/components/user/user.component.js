import { __decorate } from "tslib";
import { Component, Input } from '@angular/core';
import { PullRequestStatus } from '../../models/enums';
let UserComponent = class UserComponent {
    get approved() {
        return this.status === PullRequestStatus.Approved;
    }
    get needsWork() {
        return this.status === PullRequestStatus.NeedsWork;
    }
    constructor() {
        this.size = 30;
    }
    ngOnInit() {
        if (this.user.links?.self) {
            this.avatar = `${this.user.links.self[0].href}/avatar.png`;
        }
        this.title = this.user.displayName;
    }
};
__decorate([
    Input()
], UserComponent.prototype, "user", void 0);
__decorate([
    Input()
], UserComponent.prototype, "status", void 0);
__decorate([
    Input()
], UserComponent.prototype, "size", void 0);
UserComponent = __decorate([
    Component({
        selector: 'app-user',
        templateUrl: './user.component.html',
        styleUrls: ['./user.component.scss']
    })
], UserComponent);
export { UserComponent };
//# sourceMappingURL=user.component.js.map