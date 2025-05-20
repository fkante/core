import sgMail from "@sendgrid/mail";

sgMail.setApiKey(
  "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"
);

export async function sendEmail(
  emailTo: string[],
  subject: string,
  text: string
) {
  const msg = {
    to: emailTo,
    from: "ds@cotyapps.com",
    subject,
    text,
  };

  try {
    await sgMail.send(msg);
  } catch (err) {
    console.log("err", err);
  }
}
