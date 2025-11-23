import "~/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
	title: {
		default: "TRS - Tailored Resume Solutions | AI-Powered Resume Builder",
		template: "%s | TRS",
	},
	description:
		"Create ATS-friendly resumes in minutes with AI. Build your portfolio once, then let AI tailor your resume for each job application. Save hours and increase your interview callback rate.",
	keywords: [
		"resume builder",
		"AI resume",
		"ATS resume",
		"job application",
		"resume tailor",
		"CV builder",
		"job matching",
		"career tools",
	],
	authors: [{ name: "TRS - Tailored Resume Solutions" }],
	creator: "TRS",
	publisher: "TRS",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "https://trs.app",
		title: "TRS - Tailored Resume Solutions",
		description:
			"AI-powered resume builder that creates ATS-friendly resumes tailored to job descriptions in minutes.",
		siteName: "TRS - Tailored Resume Solutions",
	},
	twitter: {
		card: "summary_large_image",
		title: "TRS - Tailored Resume Solutions",
		description:
			"AI-powered resume builder that creates ATS-friendly resumes tailored to job descriptions.",
	},
	icons: {
		icon: [
			{ url: "/trs-logo.svg", type: "image/svg+xml" },
			{ url: "/favicon.ico", sizes: "32x32" },
		],
		shortcut: "/trs-logo.svg",
		apple: "/trs-logo.svg",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html className={`${geist.variable}`} lang="en" suppressHydrationWarning>
			<body>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					disableTransitionOnChange
					enableSystem
				>
					<TRPCReactProvider>{children}</TRPCReactProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
