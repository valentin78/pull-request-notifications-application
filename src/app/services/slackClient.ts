import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AppInjector} from '../app.module';

export const SLACK_API_URL = 'https://slack.com/api';

export class SlackClient {
  private slackApiUrl: string = SLACK_API_URL;
  private readonly token?: string;
  private http: HttpClient;

  constructor(token?: string) {
    this.token = token;
    this.http = AppInjector.get(HttpClient);
  }

  private static getHeaders(token?: string): HttpHeaders | { [p: string]: string | string[] } {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8'
    };
  }

  testAuth(token: string) {
    return this.http.post(
      `${this.slackApiUrl}/auth.test`,
      undefined,
      {headers: SlackClient.getHeaders(token)});
  }

  postMessage(options: SlackMessageOptions) {
    return this.http.post(
      `${this.slackApiUrl}/chat.postMessage`,
      options,
      {headers: SlackClient.getHeaders(this.token)});
  }
}

// https://api.slack.com/methods/chat.postMessage
export class SlackMessageOptions {
  channel!: string;
  text?: string;
  as_user?: boolean;
  attachments?: MessageAttachment[];
  blocks?: (KnownBlock | Block)[];
  // if specified, as_user must be false
  icon_emoji?: string;
  // if specified, as_user must be false
  icon_url?: string;
  // Find and link channel names and usernames.
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

/*
 * Block Elements
 */

export interface ImageElement {
  type: 'image';
  image_url: string;
  alt_text: string;
}

export interface PlainTextElement {
  type: 'plain_text';
  text: string;
  emoji?: boolean;
}

export interface MrkdwnElement {
  type: 'mrkdwn';
  text: string;
  verbatim?: boolean;
}

export interface Option {
  text: PlainTextElement | MrkdwnElement;
  value?: string;
  url?: string;
  description?: PlainTextElement;
}

export interface Confirm {
  title?: PlainTextElement;
  text: PlainTextElement | MrkdwnElement;
  confirm?: PlainTextElement;
  deny?: PlainTextElement;
  style?: 'primary' | 'danger';
}

/*
 * Action Types
 */

// Selects and Multiselects are available in different surface areas so I've separated them here
export type Select = UsersSelect | StaticSelect | ConversationsSelect | ChannelsSelect | ExternalSelect;

export type MultiSelect =
  MultiUsersSelect | MultiStaticSelect | MultiConversationsSelect | MultiChannelsSelect | MultiExternalSelect;

export interface Action {
  type: string;
  action_id?: string;
}

export interface UsersSelect extends Action {
  type: 'users_select';
  initial_user?: string;
  placeholder?: PlainTextElement;
  confirm?: Confirm;
}

export interface MultiUsersSelect extends Action {
  type: 'multi_users_select';
  initial_users?: string[];
  placeholder?: PlainTextElement;
  max_selected_items?: number;
  confirm?: Confirm;
}

export interface StaticSelect extends Action {
  type: 'static_select';
  placeholder?: PlainTextElement;
  initial_option?: Option;
  options?: Option[];
  option_groups?: {
    label: PlainTextElement;
    options: Option[];
  }[];
  confirm?: Confirm;
}

export interface MultiStaticSelect extends Action {
  type: 'multi_static_select';
  placeholder?: PlainTextElement;
  initial_options?: Option[];
  options?: Option[];
  option_groups?: {
    label: PlainTextElement;
    options: Option[];
  }[];
  max_selected_items?: number;
  confirm?: Confirm;
}

export interface ConversationsSelect extends Action {
  type: 'conversations_select';
  initial_conversation?: string;
  placeholder?: PlainTextElement;
  confirm?: Confirm;
  response_url_enabled?: boolean;
  default_to_current_conversation?: boolean;
  filter?: {
    include?: ('im' | 'mpim' | 'private' | 'public')[];
    exclude_external_shared_channels?: boolean;
    exclude_bot_users?: boolean;
  };
}

export interface MultiConversationsSelect extends Action {
  type: 'multi_conversations_select';
  initial_conversations?: string[];
  placeholder?: PlainTextElement;
  max_selected_items?: number;
  confirm?: Confirm;
  default_to_current_conversation?: boolean;
  filter?: {
    include?: ('im' | 'mpim' | 'private' | 'public')[];
    exclude_external_shared_channels?: boolean;
    exclude_bot_users?: boolean;
  };
}

export interface ChannelsSelect extends Action {
  type: 'channels_select';
  initial_channel?: string;
  placeholder?: PlainTextElement;
  confirm?: Confirm;
}

export interface MultiChannelsSelect extends Action {
  type: 'multi_channels_select';
  initial_channels?: string[];
  placeholder?: PlainTextElement;
  max_selected_items?: number;
  confirm?: Confirm;
}

export interface ExternalSelect extends Action {
  type: 'external_select';
  initial_option?: Option;
  placeholder?: PlainTextElement;
  min_query_length?: number;
  confirm?: Confirm;
}

export interface MultiExternalSelect extends Action {
  type: 'multi_external_select';
  initial_options?: Option[];
  placeholder?: PlainTextElement;
  min_query_length?: number;
  max_selected_items?: number;
  confirm?: Confirm;
}

export interface Button extends Action {
  type: 'button';
  text: PlainTextElement;
  value?: string;
  url?: string;
  style?: 'danger' | 'primary';
  confirm?: Confirm;
}

export interface Overflow extends Action {
  type: 'overflow';
  options: Option[];
  confirm?: Confirm;
}

export interface Datepicker extends Action {
  type: 'datepicker';
  initial_date?: string;
  placeholder?: PlainTextElement;
  confirm?: Confirm;
}

export interface Timepicker extends Action {
  type: 'timepicker';
  initial_time?: string;
  placeholder?: PlainTextElement;
  confirm?: Confirm;
}

export interface RadioButtons extends Action {
  type: 'radio_buttons';
  initial_option?: Option;
  options: Option[];
  confirm?: Confirm;
}

export interface Checkboxes extends Action {
  type: 'checkboxes';
  initial_options?: Option[];
  options: Option[];
  confirm?: Confirm;
}

export interface PlainTextInput extends Action {
  type: 'plain_text_input';
  placeholder?: PlainTextElement;
  initial_value?: string;
  multiline?: boolean;
  min_length?: number;
  max_length?: number;
  dispatch_action_config?: DispatchActionConfig;
}

export interface DispatchActionConfig {
  trigger_actions_on?: ('on_enter_pressed' | 'on_character_entered')[];
}

/*
 * Block Types
 */

export type KnownBlock = ImageBlock | ContextBlock | DividerBlock | SectionBlock;

export interface Block {
  type: string;
  block_id?: string;
}

export interface ImageBlock extends Block {
  type: 'image';
  image_url: string;
  alt_text: string;
  title?: PlainTextElement;
}

export interface ContextBlock extends Block {
  type: 'context';
  elements: (ImageElement | PlainTextElement | MrkdwnElement)[];
}

// export interface ActionsBlock extends Block {
//   type: 'actions';
//   elements: (Button | Overflow | Datepicker | Timepicker | Select | RadioButtons | Checkboxes | Action)[];
// }

export interface DividerBlock extends Block {
  type: 'divider';
}

export interface SectionBlock extends Block {
  type: 'section';
  text?: PlainTextElement | MrkdwnElement; // either this or fields must be defined
  fields?: (PlainTextElement | MrkdwnElement)[]; // either this or text must be defined
  accessory?: Button
    | Overflow
    | Datepicker
    | Timepicker
    | Select
    | MultiSelect
    | Action
    | ImageElement
    | RadioButtons
    | Checkboxes;
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
