export interface VirtualNumber {
  phoneNumber: string;
  sid: string;
  dateCreated: string;
  isFavorite: boolean;
  isStarred: boolean;
  countryCode?: string;
  service?: string;
}

export interface SmsMessage {
  id: string;
  body: string;
  from: string;
  dateCreated: string;
}
