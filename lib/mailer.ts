import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendLicenseKeyEmail({
  to,
  firstName,
  licenseKey,
  plan,
  expiresAt,
}: {
  to: string
  firstName: string
  licenseKey: string
  plan: string
  expiresAt: string
}) {
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1)
  const expiry = new Date(expiresAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0e1117;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0e1117;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

        <!-- Logo -->
        <tr><td style="padding-bottom:32px;text-align:center;">
          <table cellpadding="0" cellspacing="0" style="display:inline-table;">
            <tr>
              <td style="width:36px;height:36px;background:rgba(93,202,165,0.15);border:1px solid rgba(93,202,165,0.35);border-radius:9px;text-align:center;vertical-align:middle;">
                <span style="font-size:18px;line-height:36px;">&#128737;</span>
              </td>
              <td style="padding-left:10px;font-size:18px;font-weight:700;color:#f0f0f0;vertical-align:middle;">ProxySocket</td>
            </tr>
          </table>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#181c24;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:36px 32px;">

          <p style="margin:0 0 6px;font-size:13px;font-weight:600;letter-spacing:3px;color:#5dcaa5;text-transform:uppercase;">License Key</p>
          <h1 style="margin:0 0 12px;font-size:26px;font-weight:700;color:#f0f0f0;line-height:1.2;">Your Pro access is ready</h1>
          <p style="margin:0 0 28px;font-size:15px;color:rgba(255,255,255,0.5);line-height:1.6;">
            Hi ${firstName || 'there'}, your <strong style="color:#f0f0f0;">${planLabel} plan</strong> payment was confirmed. Here is your license key — enter it in the app to unlock premium.
          </p>

          <!-- Key box -->
          <div style="background:#0e1117;border:1.5px solid rgba(93,202,165,0.4);border-radius:12px;padding:20px 24px;margin-bottom:28px;text-align:center;">
            <p style="margin:0 0 8px;font-size:11px;color:rgba(255,255,255,0.3);letter-spacing:3px;text-transform:uppercase;">Your License Key</p>
            <p style="margin:0;font-family:'Courier New',monospace;font-size:22px;font-weight:700;letter-spacing:3px;color:#5dcaa5;">${licenseKey}</p>
          </div>

          <!-- Plan info -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                <span style="font-size:13px;color:rgba(255,255,255,0.4);">Plan</span>
              </td>
              <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);text-align:right;">
                <span style="font-size:13px;color:#f0f0f0;font-weight:500;">${planLabel}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;">
                <span style="font-size:13px;color:rgba(255,255,255,0.4);">Expires</span>
              </td>
              <td style="padding:10px 0;text-align:right;">
                <span style="font-size:13px;color:#f0f0f0;font-weight:500;">${expiry}</span>
              </td>
            </tr>
          </table>

          <!-- Steps -->
          <p style="margin:0 0 14px;font-size:13px;font-weight:600;color:rgba(255,255,255,0.6);">How to activate:</p>
          <table cellpadding="0" cellspacing="0" width="100%">
            ${['Open the ProxySocket app', 'Tap "I have a license key"', 'Paste your key above', "Tap Activate — you're in!"].map((s, i) => `
            <tr>
              <td style="vertical-align:top;padding:0 12px 10px 0;width:24px;">
                <div style="width:22px;height:22px;background:#5dcaa5;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:700;color:#0a1a13;">${i + 1}</div>
              </td>
              <td style="font-size:13px;color:rgba(255,255,255,0.55);padding-bottom:10px;line-height:1.5;">${s}</td>
            </tr>`).join('')}
          </table>

          <!-- CTA -->
          <div style="text-align:center;margin-top:28px;">
            <a href="https://apps.apple.com" style="display:inline-block;background:#5dcaa5;color:#0a1a13;font-size:14px;font-weight:600;padding:13px 28px;border-radius:10px;text-decoration:none;">Download ProxySocket</a>
          </div>

        </td></tr>

        <!-- Footer -->
        <tr><td style="padding-top:24px;text-align:center;">
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.2);">
            Keep this email — your license key is here. Questions? <a href="mailto:hello@deniyitunji.com" style="color:#5dcaa5;text-decoration:none;">hello@deniyitunji.com</a>
          </p>
          <p style="margin:8px 0 0;font-size:11px;color:rgba(255,255,255,0.15);">&copy; 2026 DeniyiTunji Inc.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  await transporter.sendMail({
    from: `ProxySocket <${process.env.GMAIL_USER}>`,
    to,
    subject: `Your ProxySocket license key — ${planLabel} Plan`,
    html,
  })
}
