import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { env } from "~/env";
import { db } from "~/server/db";
import { resend } from "~/server/email/resend";
import { getEmailVerificationTemplate } from "~/server/email/templates";

function getBaseUrl() {
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
	if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
	return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const auth = betterAuth({
	database: prismaAdapter(db, {
		provider: "sqlite", // or "sqlite" or "mysql"
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
	},
	emailVerification: {
		sendVerificationEmail: async ({ user, url, token }) => {
			// Better Auth provides the verification URL, but we want to redirect to our custom page
			// So we construct our own URL that will handle the verification
			const baseUrl = getBaseUrl();
			// The verification URL should point to our verify-email page with the token
			const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

			const emailTemplate = getEmailVerificationTemplate({
				verificationUrl,
				userName: user.name ?? "there",
			});

			await resend.emails.send({
				from: "ResumeAI <onboarding@resend.dev>", // Update with your verified domain
				to: user.email,
				subject: emailTemplate.subject,
				html: emailTemplate.html,
				text: emailTemplate.text,
			});
		},
	},
	socialProviders: {
		google: {
			clientId: env.BETTER_AUTH_GOOGLE_CLIENT_ID,
			clientSecret: env.BETTER_AUTH_GOOGLE_CLIENT_SECRET,
		},
	},
});

export type Session = typeof auth.$Infer.Session;
