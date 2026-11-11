import nodemailer from "nodemailer";

function getSmtpConfig() {
  const user = process.env.SMTP_USER || process.env.EMAIL_FROM_ADDRESS;
  const pass = process.env.SMTP_PASS;
  const host = process.env.SMTP_HOST || "mail.privateemail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const fromAddress =
    process.env.EMAIL_FROM_ADDRESS || user || "admin@bluzeta.com";
  const fromName = process.env.EMAIL_FROM_NAME || "bluzeta";

  return {
    host,
    port,
    secure: port === 465,
    user,
    pass,
    from: `${fromName} <${fromAddress}>`,
    fromAddress,
  };
}

function createTransporter() {
  const smtp = getSmtpConfig();
  if (!smtp.user || !smtp.pass) {
    return null;
  }
  return {
    smtp,
    transporter: nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
    }),
  };
}

export async function sendResetPasswordEmail({
  to,
  name,
  url,
}: {
  to: string;
  name: string;
  url: string;
}) {
  const mailer = createTransporter();
  if (!mailer) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[bluzeta] SMTP is not configured — password reset link for ${to}:\n${url}`,
      );
      return;
    }
    throw new Error("SMTP_USER and SMTP_PASS must be set");
  }

  const safeName = name.replace(/[<>&]/g, "");
  await mailer.transporter.sendMail({
    from: mailer.smtp.from,
    to,
    subject: "Ndrysho fjalëkalimin — bluzeta",
    html: `
      <p>Përshëndetje${safeName ? ` ${safeName}` : ""},</p>
      <p>Kliko linkun për të vendosur një fjalëkalim të ri në bluzeta:</p>
      <p><a href="${url}">Ndrysho fjalëkalimin</a></p>
      <p>Nëse s’e kërkove këtë, injoroje këtë email.</p>
    `,
  });
}

export async function sendContactEmail({
  name,
  email,
  topic,
  message,
}: {
  name: string;
  email: string;
  topic: string;
  message: string;
}) {
  const mailer = createTransporter();
  if (!mailer) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[bluzeta] SMTP is not configured — contact message from ${email} (${topic}):\n${message}`,
      );
      return;
    }
    throw new Error("SMTP_USER and SMTP_PASS must be set");
  }

  const safeName = name.replace(/[<>&]/g, "");
  const safeEmail = email.replace(/[<>&]/g, "");
  const safeTopic = topic.replace(/[<>&]/g, "");
  const safeMessage = message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  await mailer.transporter.sendMail({
    from: mailer.smtp.from,
    to: mailer.smtp.fromAddress,
    replyTo: `${safeName} <${safeEmail}>`,
    subject: `[bluzeta contact] ${safeTopic} — ${safeName}`,
    html: `
      <p><strong>From:</strong> ${safeName} &lt;${safeEmail}&gt;</p>
      <p><strong>Topic:</strong> ${safeTopic}</p>
      <p>${safeMessage.replace(/\n/g, "<br />")}</p>
    `,
  });
}
