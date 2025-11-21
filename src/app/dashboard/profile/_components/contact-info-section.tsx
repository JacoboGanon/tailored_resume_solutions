"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api, type RouterOutputs } from "~/trpc/react";

type portfolio = RouterOutputs["portfolio"]["getOrCreate"];

export function ContactInfoSection({
	portfolio,
}: {
	portfolio: portfolio | undefined;
}) {
	const utils = api.useUtils();
	const [contactInfo, setContactInfo] = useState({
		name: "",
		email: "",
		phone: "",
		linkedin: "",
		github: "",
		website: "",
	});

	const updateContactMutation = api.portfolio.updateContactInfo.useMutation({
		onSuccess: () => {
			toast.success("Contact information updated");
			void utils.portfolio.getOrCreate.invalidate();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	// Parse contact info when portfolio loads
	useEffect(() => {
		if (portfolio?.contactInfo) {
			try {
				const parsed = JSON.parse(portfolio.contactInfo);
				setContactInfo(parsed);
			} catch (e) {
				console.error("Failed to parse contact info", e);
			}
		}
	}, [portfolio?.contactInfo]);

	const handleContactInfoSave = () => {
		updateContactMutation.mutate(contactInfo);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Contact Information</CardTitle>
				<CardDescription>
					Your basic contact details for resumes
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="name">Full Name</Label>
					<Input
						id="name"
						onChange={(e) =>
							setContactInfo({ ...contactInfo, name: e.target.value })
						}
						placeholder="John Doe"
						value={contactInfo.name}
					/>
					<p className="text-muted-foreground text-xs">
						This name will appear on your generated resumes
					</p>
				</div>
				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							onChange={(e) =>
								setContactInfo({ ...contactInfo, email: e.target.value })
							}
							placeholder="your.email@example.com"
							type="email"
							value={contactInfo.email}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="phone">Phone Number</Label>
						<Input
							id="phone"
							onChange={(e) =>
								setContactInfo({ ...contactInfo, phone: e.target.value })
							}
							placeholder="+1 (555) 123-4567"
							type="tel"
							value={contactInfo.phone}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="linkedin">LinkedIn URL</Label>
						<Input
							id="linkedin"
							onChange={(e) =>
								setContactInfo({ ...contactInfo, linkedin: e.target.value })
							}
							placeholder="https://linkedin.com/in/yourprofile"
							type="url"
							value={contactInfo.linkedin}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="github">GitHub URL</Label>
						<Input
							id="github"
							onChange={(e) =>
								setContactInfo({ ...contactInfo, github: e.target.value })
							}
							placeholder="https://github.com/yourusername"
							type="url"
							value={contactInfo.github}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="website">Personal Website</Label>
						<Input
							id="website"
							onChange={(e) =>
								setContactInfo({ ...contactInfo, website: e.target.value })
							}
							placeholder="https://yourwebsite.com"
							type="url"
							value={contactInfo.website}
						/>
					</div>
				</div>
				<Button onClick={handleContactInfoSave}>
					Save Contact Information
				</Button>
			</CardContent>
		</Card>
	);
}
