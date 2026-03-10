export function renderMagicLinkEmail({ url }: { url: string }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to MRI Reviewer</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f7;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;background-color:#ffffff;border-radius:16px;border:1px solid #e5e5e5;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 0 32px;">
              <p style="margin:0;font-size:13px;font-weight:600;color:#1a1a1a;letter-spacing:-0.01em;">MRI Reviewer</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:24px 32px 0 32px;">
              <h1 style="margin:0 0 8px 0;font-size:20px;font-weight:700;color:#1a1a1a;line-height:1.3;letter-spacing:-0.02em;">Sign in to your account</h1>
              <p style="margin:0 0 24px 0;font-size:14px;color:#6b6b6b;line-height:1.6;">Click the button below to securely sign in. This link will expire in 10 minutes.</p>
            </td>
          </tr>
          <!-- CTA -->
          <tr>
            <td style="padding:0 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:10px;background-color:#1a1a1a;">
                    <a href="${url}" target="_blank" style="display:inline-block;padding:10px 24px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:-0.01em;">Sign in</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Fallback -->
          <tr>
            <td style="padding:20px 32px 0 32px;">
              <p style="margin:0;font-size:12px;color:#a0a0a0;line-height:1.5;">If the button doesn&rsquo;t work, copy and paste this link into your browser:</p>
              <p style="margin:6px 0 0 0;font-size:12px;color:#a0a0a0;line-height:1.5;word-break:break-all;">${url}</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:28px 32px 32px 32px;">
              <hr style="border:none;border-top:1px solid #f0f0f0;margin:0 0 20px 0;">
              <p style="margin:0;font-size:11px;color:#b0b0b0;line-height:1.5;">If you didn&rsquo;t request this email, you can safely ignore it. This link will expire automatically.</p>
              <p style="margin:8px 0 0 0;font-size:11px;color:#b0b0b0;">MRI Reviewer &mdash; AI-powered radiology analysis</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
