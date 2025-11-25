import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { env } from "~/env";
import { db } from "~/server/db";
import { resend } from "~/server/email/resend";

export const auth = betterAuth({
	database: prismaAdapter(db, {
		provider: "sqlite", // or "sqlite" or "mysql"
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }) => {
			await resend.emails.send({
				from: "Tailored Resume Services <onboarding@tailored-rs.com>",
				to: user.email,
				subject: "Verify your email address",
				html: `
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
						<h2 style="color: #333;">Verify your email address</h2>
						<p>Hi ${user.name ?? "there"},</p>
						<p>Thank you for signing up for ResumeAI! Please verify your email address by clicking the button below:</p>
						<a href="${url}" style="display: inline-block; background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email Address</a>
						<p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
						<p style="color: #667eea; word-break: break-all;">${url}</p>
						<p style="color: #999; font-size: 12px; margin-top: 30px;">If you didn't create an account with ResumeAI, you can safely ignore this email.</p>
					</div>
				`,
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
