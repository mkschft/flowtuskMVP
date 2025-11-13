import nodemailer from "nodemailer";

// Create reusable transporter using Gmail SMTP
const createTransporter = () => {
  const email = process.env.GMAIL_EMAIL;
  const password = process.env.GMAIL_APP_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Gmail credentials not configured. Please set GMAIL_EMAIL and GMAIL_APP_PASSWORD environment variables."
    );
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email,
      pass: password,
    },
  });
};

export interface SendInvitationEmailParams {
  to: string;
  inviteUrl: string;
  inviterName?: string;
}

export async function sendInvitationEmail({
  to,
  inviteUrl,
  inviterName = "a team member",
}: SendInvitationEmailParams): Promise<void> {
  try {
    const transporter = createTransporter();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const appName = process.env.APP_NAME || "Flowtusk";

    const mailOptions = {
      from: `"${appName}" <${process.env.GMAIL_EMAIL}>`,
      to,
      subject: `You've been invited to join ${appName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invitation to ${appName}</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 40px 20px; text-align: center;">
                  <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h1 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">
                          You've been invited!
                        </h1>
                        <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                          ${inviterName} has invited you to join <strong>${appName}</strong>.
                        </p>
                        <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                          Click the button below to accept the invitation and create your account. This invitation will expire in 7 days.
                        </p>
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="text-align: center; padding: 0 0 30px 0;">
                              <a href="${inviteUrl}" style="display: inline-block; padding: 12px 32px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 9999px; font-weight: 500; font-size: 16px;">
                                Accept Invitation
                              </a>
                            </td>
                          </tr>
                        </table>
                        <p style="margin: 0; color: #999999; font-size: 14px; line-height: 1.5;">
                          If the button doesn't work, copy and paste this link into your browser:
                        </p>
                        <p style="margin: 10px 0 0 0; color: #666666; font-size: 14px; word-break: break-all;">
                          <a href="${inviteUrl}" style="color: #0066cc; text-decoration: none;">${inviteUrl}</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 20px 0 0 0; color: #999999; font-size: 12px; text-align: center;">
                    If you didn't expect this invitation, you can safely ignore this email.
                  </p>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
      text: `
You've been invited to join ${appName}!

${inviterName} has invited you to join ${appName}.

Click the link below to accept the invitation and create your account. This invitation will expire in 7 days.

${inviteUrl}

If you didn't expect this invitation, you can safely ignore this email.
      `.trim(),
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Invitation email sent successfully to ${to}`);
  } catch (error) {
    console.error("❌ Error sending invitation email:", error);
    throw error;
  }
}

