import { HttpClient } from '@angular/common/http';
import { AppInjector } from '../app.module';
export const SLACK_API_URL = 'https://slack.com/api';
export class SlackClient {
    constructor(token) {
        this.slackApiUrl = SLACK_API_URL;
        this.token = token;
        this.http = AppInjector.get(HttpClient);
    }
    static getHeaders(token) {
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json; charset=utf-8'
        };
    }
    testAuth(token) {
        return this.http.post(`${this.slackApiUrl}/auth.test`, undefined, { headers: SlackClient.getHeaders(token) });
    }
    postMessage(options) {
        return this.http.post(`${this.slackApiUrl}/chat.postMessage`, options, { headers: SlackClient.getHeaders(this.token) });
    }
}
// https://api.slack.com/methods/chat.postMessage
export class SlackMessageOptions {
}
// export interface FileBlock extends Block {
//   type: 'file';
//   source: string; // 'remote'
//   external_id: string;
// }
// export interface HeaderBlock extends Block {
//   type: 'header';
//   text: PlainTextElement;
// }
// export interface InputBlock extends Block {
//   type: 'input';
//   label: PlainTextElement;
//   hint?: PlainTextElement;
//   optional?: boolean;
//   element: Select | MultiSelect | Datepicker | Timepicker | PlainTextInput | RadioButtons | Checkboxes;
//   dispatch_action?: boolean;
// }
//# sourceMappingURL=slackClient.js.map