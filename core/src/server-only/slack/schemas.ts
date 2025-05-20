import { z } from "zod";

export enum NotificationColor {
  "info" = "info",
  "warning" = "warning",
  "danger" = "danger",
  "good" = "good",
}
export enum ResponseType {
  "in_channel" = "in_channel",
  "ephemeral" = "ephemeral",
}
export const SlackNotification = z.object({
  channel: z.string().min(1),
  thread_ts: z.string().optional(),
  attachments: z
    .array(
      z.object({
        title: z.string().optional(),
        text: z.string().optional(),
        color: z.nativeEnum(NotificationColor).default(NotificationColor.info),
        author_name: z.string().optional(),
        response_type: z
          .nativeEnum(ResponseType)
          .default(ResponseType.in_channel),
      })
    )
    .default([]),
});
export type SlackNotification = z.infer<typeof SlackNotification>;
