export interface KeyMessagesResponse {
  keyMessages: unknown;
}

export interface InternalKeyMessage {
  number: number;
  message: string;
  label: string;
  value: string;
}