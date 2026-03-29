export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
  /** Shown in mock preview UI and logs (e.g. `application_confirmation`). */
  flow?: string;
};

export type SendEmailResult = {
  provider: string;
  messageId?: string;
};

export interface EmailProvider {
  readonly name: string;
  send(input: SendEmailInput): Promise<SendEmailResult>;
}
