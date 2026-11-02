export async function sendResetPasswordEmail({
  to,
  name,
  url,
}: {
  to: string;
  name: string;
  url: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }

  const from = process.env.RESEND_FROM_EMAIL || "bluzeta <beth.t@example.com>";
  const safeName = name.replace(/[<>&]/g, "");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Ndrysho fjalëkalimin — bluzeta",
      html: `
        <p>Përshëndetje${safeName ? ` ${safeName}` : ""},</p>
        <p>Kliko linkun për të vendosur një fjalëkalim të ri në bluzeta:</p>
        <p><a href="${url}">Ndrysho fjalëkalimin</a></p>
        <p>Nëse s’e kërkove këtë, injoroje këtë email.</p>
      `,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to send reset email (${res.status})`);
  }
}
