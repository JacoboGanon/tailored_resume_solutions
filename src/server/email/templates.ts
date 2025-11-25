/**
 * Escapes HTML entities to prevent XSS attacks
 */
function escapeHtml(unsafe: string): string {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

/**
 * Validates and sanitizes URL for use in HTML href attribute
 * Ensures the URL is properly formatted and safe to use
 */
function sanitizeUrlForHref(url: string): string {
	try {
		// Validate URL format and ensure proper encoding
		const urlObj = new URL(url);
		// Return properly encoded URL (URL constructor handles encoding)
		return urlObj.toString();
	} catch {
		// If URL parsing fails, return empty string or a safe fallback
		// In production, you might want to log this error
		return "#";
	}
}

export function getEmailVerificationTemplate({
	verificationUrl,
	userName,
}: {
	verificationUrl: string;
	userName: string;
}) {
	// Escape user inputs to prevent HTML injection
	const escapedUserName = escapeHtml(userName);
	// For href attribute, use properly formatted URL (we control this, but validate it)
	const sanitizedVerificationUrl = sanitizeUrlForHref(verificationUrl);
	// For text content, escape HTML entities
	const escapedVerificationUrlText = escapeHtml(verificationUrl);

	return {
		subject: "Verify your email address",
		html: `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Verify your email</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
		<h1 style="color: white; margin: 0; font-size: 28px;">ResumeAI</h1>
	</div>
	<div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
		<h2 style="color: #333; margin-top: 0;">Verify your email address</h2>
		<p style="color: #666; font-size: 16px;">Hi ${escapedUserName},</p>
		<p style="color: #666; font-size: 16px;">Thank you for signing up for ResumeAI! Please verify your email address by clicking the button below:</p>
		<div style="text-align: center; margin: 30px 0;">
			<a href="${sanitizedVerificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Verify Email Address</a>
		</div>
		<p style="color: #999; font-size: 14px; margin-top: 30px;">If the button doesn't work, copy and paste this link into your browser:</p>
		<p style="color: #667eea; font-size: 14px; word-break: break-all;">${escapedVerificationUrlText}</p>
		<p style="color: #999; font-size: 14px; margin-top: 30px;">This link will expire in 24 hours.</p>
		<p style="color: #999; font-size: 14px; margin-top: 30px;">If you didn't create an account with ResumeAI, you can safely ignore this email.</p>
	</div>
	<div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
		<p>© ${new Date().getFullYear()} ResumeAI. All rights reserved.</p>
	</div>
</body>
</html>
		`,
		text: `
Verify your email address

Hi ${userName},

Thank you for signing up for ResumeAI! Please verify your email address by visiting the link below:

${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account with ResumeAI, you can safely ignore this email.

© ${new Date().getFullYear()} ResumeAI. All rights reserved.
		`,
	};
}
