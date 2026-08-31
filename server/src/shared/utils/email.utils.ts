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
  // Skip external SMTP attempts during automated test execution for instant speed
  if (process.env.NODE_ENV === "test") {
    return null;
  }

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

export async function sendEmail(params: { to: string; subject: string; html: string }): Promise<void> {
  try {
    const transporter = await getTransporter();
    if (!transporter) {
      return;
    }

    const fromAddress = process.env.SMTP_FROM || `"Tenour Platform" <${process.env.SMTP_USER || "noreply@tenour.com"}>`;
    await transporter.sendMail({
      from: fromAddress,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
  } catch (error: any) {
    console.error(`[Email Utility] ❌ Failed to send email to ${params.to}:`, error.message);
  }
}

export async function sendInvitationEmail(params: SendInvitationEmailParams): Promise<string | null> {
  try {
    const transporter = await getTransporter();
    const fromAddress = process.env.SMTP_FROM || `"Tenour Platform" <${process.env.SMTP_USER || "noreply@tenour.com"}>`;

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e2e8f0; rounded: 16px;">
        <div style="margin-bottom: 24px;">
          <h2 style="color: #0f172a; margin: 0 0 8px 0; font-size: 20px;">You're Invited to Join ${params.organizationName}</h2>
          <p style="color: #475569; font-size: 14px; margin: 0;">Hi ${params.recipientName}, you have been assigned the <strong>${params.roleName}</strong> role on the Tenour Procurement OS.</p>
        </div>
        <div style="margin-bottom: 24px; padding: 16px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b;">Click below to set your account password and join your workspace:</p>
          <a href="${params.invitationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #0f172a; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 13px;">Accept Invitation</a>
        </div>
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">Or copy this link into your browser: <br/><span style="color: #2383E2;">${params.invitationUrl}</span></p>
      </div>
    `;

    if (!transporter) {
      return params.invitationUrl;
    }

    const info = await transporter.sendMail({
      from: fromAddress,
      to: params.toEmail,
      subject: `Invitation to join ${params.organizationName} on Tenour`,
      html: htmlContent,
    });

    return nodemailer.getTestMessageUrl(info) || null;
  } catch (error: any) {
    console.error(`[Email Utility] ❌ Failed to send invitation email to ${params.toEmail}:`, error.message);
    return null;
  }
}
