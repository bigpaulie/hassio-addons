/** Author info included in webhook message payloads. */
export interface MessageAuthor {
  username: string;
  id: string;
}

/** Referenced message info when forwarding a reply. */
export interface MessageReplyTo {
  message_id: string;
  channel_id: string;
  content?: string;
  author?: MessageAuthor;
}

/** JSON body POSTed to the configured webhook. */
export interface MessagePayload {
  message_id: string;
  channel_id: string;
  content: string;
  author: MessageAuthor;
  reply_to?: MessageReplyTo;
}
