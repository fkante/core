import { type InternalKeyMessage } from "./kwartz.types";
import { type KeyMessage } from "@kovalee/core";

export class KeyMessagesMapper {
  static toInternalKeyMessages(keyMessages: KeyMessage[]): InternalKeyMessage[] {
    const keyMessagesSorted = keyMessages.sort((a, b) => a.keyMessageNumber - b.keyMessageNumber);
    const keyMessagesInternal = keyMessagesSorted.map((keyMessage) => {
      return {
        number: keyMessage.keyMessageNumber,
        message: keyMessage.keyMessage,
        label: `${keyMessage.keyMessageNumber} - ${keyMessage.keyMessage}`,
        value: `${keyMessage.appCode}_${keyMessage.keyMessage}_${keyMessage.keyMessageNumber}`,
      };
    });
    return keyMessagesInternal;
  }
}