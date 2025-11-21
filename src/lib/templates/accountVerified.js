export const accountVerifiedTemplate = (firstName) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Verified</title>
</head>
<body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f4f6f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0; background-color:#f4f6f8;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600px" style="background:#fff; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,0.1); padding:30px;">
          <tr>
            <td align="center" style="background-color:#1E40AF; padding:20px; color:#fff; border-radius:8px 8px 0 0;">
              <h1 style="margin:0; font-size:24px;">Softex Cloud Bucket Account Verified</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:30px 20px; color:#111827; font-size:16px; line-height:1.5;">
              <p>Hello ${firstName},</p>
              <p>Your Softex Cloud Bucket account has been successfully verified. You can now access all features.</p>
              <p>Thanks,<br><strong>Softex Cloud Bucket Team</strong></p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:20px; font-size:12px; color:#6B7280;">
              &copy; 2025 Softex Cloud Bucket. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
