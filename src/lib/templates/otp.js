export const otpTemplate = (otp) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your OTP Code</title>
</head>
<body style="margin:0; padding:0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f4f6f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600px" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
          <tr>
            <td align="center" style="padding: 30px 20px; background-color:#1E40AF; color:#ffffff; border-top-left-radius:8px; border-top-right-radius:8px;">
              <h1 style="margin:0; font-size:24px;">Softex Cloud Bucket</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 20px; color:#111827; font-size:16px; line-height:1.5;">
              <p>Hello,</p>
              <p>Use the OTP code below to verify your email. It is valid for <strong>10 minutes</strong>.</p>
              <p style="text-align:center; margin:30px 0;">
                <span style="display:inline-block; font-size:24px; letter-spacing:4px; font-weight:bold; color:#1E40AF; padding:15px 25px; border:2px dashed #1E40AF; border-radius:8px;">
                  ${otp}
                </span>
              </p>
              <p>If you did not request this code, ignore this email.</p>
              <p>Thanks,<br><strong>Softex Cloud Bucket Team</strong></p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 20px; font-size:12px; color:#6B7280;">
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
