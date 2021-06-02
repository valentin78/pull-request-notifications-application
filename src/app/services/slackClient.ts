import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AppInjector} from '../app.module';

export class SlackClient {
  private slackApiUrl: string = 'https://slack.com/api/';
  private readonly token?: string;
  private http: HttpClient;

  constructor(token?: string) {
    this.token = token;
    this.http = AppInjector.get(HttpClient);
  }

  private getHeaders(token?: string): HttpHeaders | { [p: string]: string | string[] } {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8'
    };
  }

  testAuth(token: string) {
    return this.http.post(
      `${this.slackApiUrl}/auth.test`,
      undefined,
      {headers: this.getHeaders(token)});
  }

  postMessage(options: SlackMessageOptions) {
    return this.http.post(
      `${this.slackApiUrl}/chat.postMessage`,
      options,
      {headers: this.getHeaders(this.token)});
  }
}

export class SlackMessageOptions {
  channel!: string;
  text?: string;
  as_user?: boolean;
  attachments?: MessageAttachment[];
  // blocks?: (KnownBlock | Block)[];
  // if specified, as_user must be false
  icon_emoji?: string;
  // if specified, as_user must be false
  icon_url?: string;
  link_names?: boolean;
  mrkdwn?: boolean;
  parse?: 'full' | 'none';

  // if specified, thread_ts must be set
  reply_broadcast?: boolean;
  thread_ts?: string;
  unfurl_links?: boolean;
  unfurl_media?: boolean;
  // if specified, as_user must be false
  username?: string;
}

export interface MessageAttachment {
  // blocks?: (KnownBlock | Block)[];
  // either this or text must be defined
  fallback?: string;
  color?: 'good' | 'warning' | 'danger' | string;
  pretext?: string;
  author_name?: string;
  // author_name must be present
  author_link?: string;
  // author_name must be present
  author_icon?: string;
  title?: string;
  // title must be present
  title_link?: string;
  // either this or fallback must be defined
  text?: string;
  fields?: {
    title: string;
    value: string;
    short?: boolean;
  }[];
  image_url?: string;
  thumb_url?: string;
  footer?: string;
  // footer must be present
  footer_icon?: string;
  ts?: string;
  actions?: AttachmentAction[];
  callback_id?: string;
  mrkdwn_in?: ('pretext' | 'text' | 'fields')[];
}

export interface AttachmentAction {
  id?: string;
  confirm?: Confirmation;
  data_source?: 'static' | 'channels' | 'conversations' | 'users' | 'external';
  min_query_length?: number;
  name?: string;
  options?: OptionField[];
  option_groups?: {
    text: string
    options: OptionField[];
  }[];
  selected_options?: OptionField[];
  style?: 'default' | 'primary' | 'danger';
  text: string;
  type: 'button' | 'select';
  value?: string;
  url?: string;
}

export interface Confirmation {
  dismiss_text?: string;
  ok_text?: string;
  text: string;
  title?: string;
}

export interface OptionField {
  description?: string;
  text: string;
  value: string;
}
