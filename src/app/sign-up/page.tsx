"use client";

import { FileText, Loader2 } from "lucide-react";
import Link from "next/link";
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

export default function SignUpPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [name, setName] = useState("");
	const [showSuccessMessage, setShowSuccessMessage] = useState(false);

	const handleEmailSignUp = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		// Validate password confirmation
		if (password !== confirmPassword) {
			setError("Passwords do not match");
			setIsLoading(false);
			return;
		}

		// Validate password length (Better Auth requires minimum 8 characters)
		if (password.length < 8) {
			setError("Password must be at least 8 characters long");
			setIsLoading(false);
			return;
		}

		try {
			const result = await authClient.signUp.email({
				email,
				password,
				name,
				callbackURL: "/verify-email",
			});

			if (result.error) {
				setError(result.error.message ?? "Failed to sign up");
			} else {
				// Show success message instead of redirecting
				setShowSuccessMessage(true);
			}
		} catch {
			setError("An unexpected error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleSignUp = async () => {
		setIsGoogleLoading(true);
		setError(null);

		try {
			await authClient.signIn.social({
				provider: "google",
				callbackURL: "/dashboard",
			});
		} catch {
			setError("Failed to sign up with Google");
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
					<CardTitle className="text-2xl">Create an account</CardTitle>
					<CardDescription>
						Sign up to get started with ResumeAI
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{error && (
						<div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
							{error}
						</div>
					)}

					{showSuccessMessage && (
						<div className="space-y-2 rounded-md bg-green-500/10 p-4 text-green-700 text-sm dark:text-green-400">
							<p className="font-semibold">Check your email!</p>
							<p>
								We&apos;ve sent a verification link to <strong>{email}</strong>.
								Please click the link in the email to verify your account before
								signing in.
							</p>
							<p className="text-muted-foreground text-xs">
								Didn&apos;t receive the email? Check your spam folder or try
								signing up again.
							</p>
						</div>
					)}

					{/* Google Sign Up */}
					<Button
						className="w-full"
						disabled={isGoogleLoading}
						onClick={handleGoogleSignUp}
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

					{/* Email Sign Up Form */}
					{!showSuccessMessage && (
						<form className="space-y-4" onSubmit={handleEmailSignUp}>
							<div className="space-y-2">
								<Label htmlFor="name">Name</Label>
								<Input
									disabled={isLoading}
									id="name"
									onChange={(e) => setName(e.target.value)}
									placeholder="John Doe"
									required
									type="text"
									value={name}
								/>
							</div>
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
									minLength={8}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="Enter your password (min. 8 characters)"
									required
									type="password"
									value={password}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="confirmPassword">Confirm Password</Label>
								<Input
									disabled={isLoading}
									id="confirmPassword"
									minLength={8}
									onChange={(e) => setConfirmPassword(e.target.value)}
									placeholder="Confirm your password"
									required
									type="password"
									value={confirmPassword}
								/>
							</div>
							<Button className="w-full" disabled={isLoading} type="submit">
								{isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
								Sign Up
							</Button>
						</form>
					)}
				</CardContent>
				<CardFooter className="flex flex-col gap-4 text-center text-muted-foreground text-sm">
					<div>
						Already have an account?{" "}
						<Link
							className="text-primary underline-offset-4 hover:underline"
							href="/sign-in"
						>
							Sign in
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
