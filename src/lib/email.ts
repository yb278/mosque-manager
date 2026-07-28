import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendPasswordEmail(
  to: string,
  name: string,
  password: string
) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM || "AEC Strategy <noreply@yourdomain.com>",
    to,
    subject: "Your AEC Strategy account",
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#d30918">Welcome to AEC Strategy</h2>
      <p>Hi ${name},</p>
      <p>Your account has been created. Use the credentials below to sign in:</p>
      <table style="background:#f4f4f5;padding:16px;border-radius:8px;margin:16px 0;width:100%">
        <tr><td style="font-size:12px;color:#71717a">Email</td></tr>
        <tr><td style="font-weight:bold;font-size:14px">${to}</td></tr>
        <tr><td style="font-size:12px;color:#71717a;padding-top:8px">Password</td></tr>
        <tr><td style="font-weight:bold;font-size:14px;font-family:monospace">${password}</td></tr>
      </table>
      <a href="${process.env.NEXTAUTH_URL}/login" style="display:inline-block;background:#d30918;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:14px">Sign In</a>
      <p style="font-size:12px;color:#71717a;margin-top:16px">You'll be asked to set a new password on first login.</p>
    </div>`,
  });
}

export async function sendResetEmail(
  to: string,
  name: string,
  token: string
) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  await resend.emails.send({
    from: process.env.EMAIL_FROM || "AEC Strategy <noreply@yourdomain.com>",
    to,
    subject: "Reset your AEC Strategy password",
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#d30918">Reset your password</h2>
      <p>Hi ${name},</p>
      <p>Click the button below to reset your password. This link expires in 1 hour.</p>
      <a href="${resetUrl}" style="display:inline-block;background:#d30918;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:14px">Reset Password</a>
      <p style="font-size:12px;color:#71717a;margin-top:16px">If you didn't request this, you can ignore this email.</p>
    </div>`,
  });
}
