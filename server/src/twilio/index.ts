import { env } from "../env";

const url = "https://api.sendgrid.com/v3/";

type SendGridBody = {
  personalizations: {
    to: { email: string }[];
    subject: string;
  }[];
  from: {
    email: string;
  };
  content: {
    type: string;
    value: string;
  }[];
  attachments?: {
    content: string;
    filename: string;
  }[];
};

async function sendGridEmail(
  to: string,
  subject: string,
  body: string,
  attachments?: { filename: string; content: string; type: string }[]
) {
  const emails = to.split(",");
  const sendGridbody: SendGridBody = {
    personalizations: [
      {
        to: emails.map((email) => ({ email })),
        subject,
      },
    ],
    from: {
      email: "content@kovalee.app",
    },
    content: [
      {
        type: "text/plain",
        value: body,
      },
    ],
  };
  if (attachments) {
    sendGridbody.attachments = attachments.map((attachment) => {
      const base64Content = Buffer.from(attachment.content).toString("base64");
      return {
        content: base64Content,
        filename: attachment.filename,
        type: attachment.type,
        disposition: "attachment",
      };
    });
  }
  const response = await fetch(url + "mail/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.SEND_GRID_API_KEY}`,
    },
    body: JSON.stringify(sendGridbody),
  });
  if (!response.ok) {
    console.log(await response.text());
    throw new Error("Failed to send email");
  }
}

export { sendGridEmail };
