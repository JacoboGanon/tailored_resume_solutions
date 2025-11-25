"use client";

import { FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authClient } from "~/server/better-auth/client";

export default function SignInPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleEmailSignIn = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);
		setSuccessMessage(null);

		try {
			const result = await authClient.signIn.email({
				email,
				password,
			});

			if (result.error) {
				// Check if error is related to unverified email
				const errorMessage = result.error.message ?? "Failed to sign in";
				if (
					errorMessage.toLowerCase().includes("email") &&
					errorMessage.toLowerCase().includes("verify")
				) {
					setError(
						"Please verify your email address before signing in. Check your inbox for the verification link.",
					);
				} else {
					setError(errorMessage);
				}
			} else {
				router.push("/dashboard");
			}
		} catch {
			setError("An unexpected error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleSignIn = async () => {
		setIsGoogleLoading(true);
		setError(null);

		try {
			await authClient.signIn.social({
				provider: "google",
				callbackURL: "/dashboard",
			});
		} catch {
			setError("Failed to sign in with Google");
			setIsGoogleLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-background to-muted/30 px-4">
			{/* Logo */}
			<Link className="mb-8 flex items-center gap-2" href="/">
				<FileText className="size-8 text-primary" />
				<span className="font-bold text-2xl">ResumeAI</span>
			</Link>

			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl">Welcome back</CardTitle>
					<CardDescription>Sign in to your account to continue</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{error && (
						<div className="space-y-2 rounded-md bg-destructive/10 p-3 text-destructive text-sm">
							<p>{error}</p>
							{error.toLowerCase().includes("verify") && (
								<Button
									className="mt-2 w-full"
									onClick={async () => {
										try {
											await authClient.sendVerificationEmail({
												email,
												callbackURL: "/verify-email",
											});
											setError(null);
											setSuccessMessage(
												"Verification email sent! Please check your inbox.",
											);
										} catch {
											setError(
												"Failed to resend verification email. Please try again.",
											);
										}
									}}
									size="sm"
									variant="outline"
								>
									Resend Verification Email
								</Button>
							)}
						</div>
					)}
					{successMessage && (
						<div className="rounded-md bg-green-500/10 p-3 text-green-700 text-sm dark:text-green-400">
							{successMessage}
						</div>
					)}

					{/* Google Sign In */}
					<Button
						className="w-full"
						disabled={isGoogleLoading}
						onClick={handleGoogleSignIn}
						variant="outline"
					>
						{isGoogleLoading ? (
							<Loader2 className="mr-2 size-4 animate-spin" />
						) : (
							<svg className="mr-2 size-4" viewBox="0 0 24 24">
								<title>Google logo</title>
								<path
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
									fill="currentColor"
								/>
								<path
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									fill="currentColor"
								/>
								<path
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
									fill="currentColor"
								/>
								<path
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									fill="currentColor"
								/>
							</svg>
						)}
						Continue with Google
					</Button>

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-card px-2 text-muted-foreground">
								Or continue with email
							</span>
						</div>
					</div>

					{/* Email Sign In Form */}
					<form className="space-y-4" onSubmit={handleEmailSignIn}>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								disabled={isLoading}
								id="email"
								onChange={(e) => setEmail(e.target.value)}
								placeholder="name@example.com"
								required
								type="email"
								value={email}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								disabled={isLoading}
								id="password"
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Enter your password"
								required
								type="password"
								value={password}
							/>
						</div>
						<Button className="w-full" disabled={isLoading} type="submit">
							{isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
							Sign In
						</Button>
					</form>
				</CardContent>
				<CardFooter className="flex flex-col gap-4 text-center text-muted-foreground text-sm">
					<div>
						Don&apos;t have an account?{" "}
						<Link
							className="text-primary underline-offset-4 hover:underline"
							href="/sign-up"
						>
							Sign up
						</Link>
					</div>
					<Link
						className="text-muted-foreground underline-offset-4 hover:underline"
						href="/"
					>
						Back to home
					</Link>
				</CardFooter>
			</Card>
		</div>
	);
}
