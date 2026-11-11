"use server";

import { sendContactEmail } from "@/lib/email";
import { verifyTurnstileToken } from "@/lib/turnstile";

const TOPICS = new Set(["feature", "issue", "collab", "other"]);

export type ContactResult =
  | { status: "sent" }
  | { status: "invalid" }
  | { status: "bot" }
  | { status: "error" };

export async function submitContactAction(formData: FormData): Promise<ContactResult> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const topic = String(formData.get("topic") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const turnstileToken = String(formData.get("cf-turnstile-response") || "");

  if (
    name.length < 2 ||
    !email.includes("@") ||
    !TOPICS.has(topic) ||
    message.length < 10
  ) {
    return { status: "invalid" };
  }

  try {
    const human = await verifyTurnstileToken(turnstileToken);
    if (!human) {
      return { status: "bot" };
    }

    await sendContactEmail({ name, email, topic, message });
    return { status: "sent" };
  } catch (error) {
    console.error("[bluzeta] contact form failed", error);
    return { status: "error" };
  }
}
