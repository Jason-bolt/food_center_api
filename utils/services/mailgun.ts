import Mailgun from "mailgun.js";
import FormData from "form-data";
import logger from "../logger";

const buildClient = () => {
  const apiKey = process.env.MAILGUN_API_KEY;
  if (!apiKey) throw new Error("MAILGUN_API_KEY is not set");
  const mg = new Mailgun(FormData);
  // Use EU endpoint if region env var says so, otherwise default US
  const url =
    process.env.MAILGUN_REGION === "eu"
      ? "https://api.eu.mailgun.net"
      : undefined;
  return mg.client({ username: "api", key: apiKey, ...(url ? { url } : {}) });
};

const welcomeEmailHtml = (firstName: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Food Center</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#f97316 0%,#ea580c 100%);padding:40px 48px 36px;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.75);">FOOD CENTER</p>
              <h1 style="margin:0;font-size:32px;font-weight:900;color:#ffffff;line-height:1.2;">
                Welcome, ${firstName}! 🍽️
              </h1>
              <p style="margin:12px 0 0;font-size:16px;color:rgba(255,255,255,0.85);line-height:1.5;">
                Your account is ready. Time to discover the world through food.
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 48px;">
              <p style="margin:0 0 28px;font-size:16px;color:#374151;line-height:1.7;">
                We're thrilled to have you on board. Here's everything you can do with your new Food Center account:
              </p>

              <!-- Feature 1 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;background:#fff7ed;border-radius:16px;overflow:hidden;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:18px;">✦ AI Chef</p>
                    <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:#111827;">Generate recipes from any ingredients</p>
                    <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
                      Tell the AI Chef what's in your kitchen and get personalized recipe suggestions — complete with images, steps, and a PDF to keep.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Feature 2 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;background:#f0fdf4;border-radius:16px;overflow:hidden;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:18px;">🔖 Saved Recipes</p>
                    <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:#111827;">Build your personal recipe library</p>
                    <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
                      Save any AI-generated recipe and organise them into collections — "Weeknight Dinners", "African Classics", or anything you like.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Feature 3 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:36px;background:#eff6ff;border-radius:16px;overflow:hidden;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:18px;">🌍 Explore World Foods</p>
                    <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:#111827;">Discover dishes from every culture</p>
                    <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
                      Browse hundreds of dishes filtered by country and region. Watch videos from food creators and dive into the cultural story behind every meal.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${process.env.CLIENT_URL ?? "http://localhost:5173"}/ai"
                       style="display:inline-block;background:linear-gradient(135deg,#f97316,#ea580c);color:#ffffff;font-size:16px;font-weight:800;text-decoration:none;padding:16px 40px;border-radius:14px;letter-spacing:0.3px;">
                      Try AI Chef Now →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #f3f4f6;padding:24px 48px;text-align:center;">
              <p style="margin:0 0 6px;font-size:13px;color:#9ca3af;">
                You're receiving this because you just created a Food Center account.
              </p>
              <p style="margin:0;font-size:12px;color:#d1d5db;">
                &copy; ${new Date().getFullYear()} Food Center &nbsp;·&nbsp; Africa &amp; World Cuisine
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

const welcomeEmailText = (firstName: string) => `
Welcome to Food Center, ${firstName}!

Your account is ready. Here's what you can do:

✦ AI Chef — Tell us what ingredients you have and get personalized recipes instantly.
🔖 Saved Recipes — Save your favourites and organise them into collections.
🌍 Explore World Foods — Browse dishes from every country and region.

Get started: ${process.env.CLIENT_URL ?? "http://localhost:5173"}/ai

© ${new Date().getFullYear()} Food Center
`.trim();

/**
 * Sends a "want to be featured" inquiry to the platform admin.
 * Errors are caught and logged — a failed email never blocks the response.
 */
export const sendFeaturedInquiryEmail = async (params: {
  name: string;
  email: string;
  message: string;
}): Promise<void> => {
  const domain = process.env.MAILGUN_DOMAIN;
  const from = process.env.MAILGUN_FROM ?? `Food Center <noreply@${domain}>`;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!domain || !adminEmail) {
    logger.warn("[Mailgun]: MAILGUN_DOMAIN or ADMIN_EMAIL not set — skipping inquiry email");
    return;
  }

  try {
    const client = buildClient();
    await client.messages.create(domain, {
      from,
      to: [adminEmail],
      "reply-to": params.email,
      subject: `Featured Creator Inquiry — ${params.name}`,
      text: `New featured slot inquiry\n\nName: ${params.name}\nEmail: ${params.email}\n\nMessage:\n${params.message}\n\nReply directly to this email to respond.`,
      html: `
        <p><strong>New featured slot inquiry</strong></p>
        <p><strong>Name:</strong> ${params.name}<br/>
        <strong>Email:</strong> <a href="mailto:${params.email}">${params.email}</a></p>
        <p><strong>Message:</strong><br/>${params.message.replace(/\n/g, "<br/>")}</p>
        <hr/>
        <p style="color:#9ca3af;font-size:12px;">Reply directly to this email to respond to the creator.</p>
      `.trim(),
    });
    logger.info({ email: params.email }, "[Mailgun]: Featured inquiry email sent");
  } catch (err) {
    logger.error({ err }, "[Mailgun]: Failed to send featured inquiry email");
  }
};

/**
 * Sends a welcome email to a newly registered user.
 * Errors are caught and logged — a failed email never breaks registration.
 */
export const sendWelcomeEmail = async (params: {
  email: string;
  name: string;
}): Promise<void> => {
  const domain = process.env.MAILGUN_DOMAIN;
  const from = process.env.MAILGUN_FROM ?? `Food Center <noreply@${domain}>`;

  if (!domain) {
    logger.warn("[Mailgun]: MAILGUN_DOMAIN is not set — skipping welcome email");
    return;
  }

  const firstName = params.name.split(" ")[0];

  try {
    const client = buildClient();

    await client.messages.create(domain, {
      from,
      to: [params.email],
      subject: `Welcome to Food Center, ${firstName}! 🍽️`,
      html: welcomeEmailHtml(firstName),
      text: welcomeEmailText(firstName),
    });

    logger.info({ email: params.email }, "[Mailgun]: Welcome email sent");
  } catch (err) {
    logger.error({ err, email: params.email }, "[Mailgun]: Failed to send welcome email");
  }
};
