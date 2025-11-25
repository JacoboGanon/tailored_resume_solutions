"use client";

import { FileText, Loader2, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { authClient } from "~/server/better-auth/client";

export default function VerifyEmailPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const [status, setStatus] = useState<"loading" | "success" | "error">(
		"loading",
	);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		if (!token) {
			setStatus("error");
			setErrorMessage("No verification token provided");
			return;
		}

		const verifyEmail = async () => {
			try {
				// Better Auth handles email verification through the API route
				// The endpoint is /api/auth/verify-email with token in the request body
				const response = await fetch("/api/auth/verify-email", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ token }),
				});

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({
						message: "Failed to verify email",
					}));
					setErrorMessage(
						errorData.message ?? errorData.error ?? "Failed to verify email",
					);
					setStatus("error");
					return;
				}

				setStatus("success");
			} catch (error) {
				setErrorMessage("An unexpected error occurred");
				setStatus("error");
			}
		};

		verifyEmail();
	}, [token]);

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-background to-muted/30 px-4">
			{/* Logo */}
			<Link className="mb-8 flex items-center gap-2" href="/">
				<FileText className="size-8 text-primary" />
				<span className="font-bold text-2xl">ResumeAI</span>
			</Link>

			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl">Email Verification</CardTitle>
					<CardDescription>
						{status === "loading" && "Verifying your email address..."}
						{status === "success" && "Email verified successfully!"}
						{status === "error" && "Verification failed"}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{status === "loading" && (
						<div className="flex flex-col items-center justify-center py-8">
							<Loader2 className="size-12 animate-spin text-primary" />
							<p className="mt-4 text-muted-foreground text-sm">
								Please wait while we verify your email...
							</p>
						</div>
					)}

					{status === "success" && (
						<div className="flex flex-col items-center justify-center py-8">
							<CheckCircle2 className="size-12 text-green-500" />
							<p className="mt-4 text-center text-muted-foreground text-sm">
								Your email has been verified successfully! You can now sign in
								to your account.
							</p>
						</div>
					)}

					{status === "error" && (
						<div className="flex flex-col items-center justify-center py-8">
							<XCircle className="size-12 text-destructive" />
							<p className="mt-4 text-center text-destructive text-sm">
								{errorMessage ??
									"The verification link is invalid or has expired."}
							</p>
							<p className="mt-2 text-center text-muted-foreground text-xs">
								Please request a new verification email or contact support if
								the problem persists.
							</p>
						</div>
					)}
				</CardContent>
				<CardFooter className="flex flex-col gap-4">
					{status === "success" && (
						<Button
							className="w-full"
							onClick={() => router.push("/sign-in")}
						>
							Go to Sign In
						</Button>
					)}
					{status === "error" && (
						<Button
							className="w-full"
							variant="outline"
							onClick={() => router.push("/sign-up")}
						>
							Back to Sign Up
						</Button>
					)}
					<Link
						className="text-center text-muted-foreground underline-offset-4 hover:underline text-sm"
						href="/"
					>
						Back to home
					</Link>
				</CardFooter>
			</Card>
		</div>
	);
}

