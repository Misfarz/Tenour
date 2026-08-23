import nodemailer from "nodemailer";

interface SendInvitationEmailParams {
  toEmail: string;
  recipientName: string;
  organizationName: string;
  roleName: string;
  invitationUrl: string;
}

let testTransporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter | null> {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const isGmail = process.env.SMTP_HOST.includes("gmail");
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || (isGmail ? 465 : 587),
      secure: isGmail || process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback to Ethereal Email test account for development (skipped in test runner for speed)
  if (process.env.NODE_ENV === "test") {
    return null;
  }

  if (!testTransporter) {
    const testAccount = await nodemailer.createTestAccount();
    testTransporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return testTransporter;
}

export async function sendInvitationEmail(params: SendInvitationEmailParams): Promise<string | null> {
  try {
    const transporter = await getTransporter();

    if (!transporter) {
      console.log(`[Email Utility] ✉️ Test Mode: Invitation email constructed for ${params.toEmail}`);
      return params.invitationUrl;
    }

    const fromAddress = process.env.SMTP_FROM || `"Tenour Platform" <${process.env.SMTP_USER || "noreply@tenour.com"}>`;
    const subject = `You've been invited to join ${params.organizationName} on Tenour`;

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
        <div style="margin-bottom: 24px; text-align: left;">
          <div style="display: inline-block; background-color: #0f172a; color: #ffffff; width: 36px; height: 36px; border-radius: 8px; text-align: center; line-height: 36px; font-weight: 900; font-size: 18px;">
            N
          </div>
          <span style="font-weight: 800; font-size: 20px; color: #0f172a; margin-left: 8px; vertical-align: middle;">Tenour</span>
        </div>

        <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 12px; letter-spacing: -0.5px;">
          You're invited to join ${params.organizationName}
        </h2>

        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px;">
          Hi <strong>${params.recipientName}</strong>,<br />
          You have been invited to join <strong>${params.organizationName}</strong> on the Tenour procurement platform as an assigned <strong>${params.roleName}</strong>.
        </p>

        <div style="margin-bottom: 32px;">
          <a href="${params.invitationUrl}" style="display: inline-block; background-color: #2383E2; color: #ffffff; font-weight: 600; font-size: 14px; padding: 12px 28px; text-decoration: none; border-radius: 8px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);">
            Accept Invitation & Set Password →
          </a>
        </div>

        <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 24px;">
          Or copy and paste this link into your web browser:<br />
          <a href="${params.invitationUrl}" style="color: #2383E2; text-decoration: underline; word-break: break-all;">${params.invitationUrl}</a>
        </p>

        <p style="font-size: 11px; color: #cbd5e1; margin-top: 16px;">
          This invitation link expires in 48 hours. If you did not expect this invitation, you can safely ignore this email.
        </p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: params.toEmail,
      subject,
      html: htmlContent,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Email Utility] ✉️ Invitation Email sent to ${params.toEmail}!`);
      console.log(`[Email Utility] 🔗 Preview Test Email URL: ${previewUrl}`);
      return previewUrl as string;
    }

    console.log(`[Email Utility] ✉️ Real Invitation Email sent successfully to ${params.toEmail}`);
    return null;
  } catch (error: any) {
    console.error(`[Email Utility] ❌ Failed to send email to ${params.toEmail}:`, error.message);
    if (error.message?.includes("Invalid login") || error.message?.includes("Username and Password not accepted")) {
      console.error(`[Email Utility] 💡 Gmail Tip: Standard Gmail passwords are blocked. Please generate a 16-character Google App Password at: https://myaccount.google.com/apppasswords and use it as SMTP_PASS in server/.env`);
    }
    return null;
  }
}
