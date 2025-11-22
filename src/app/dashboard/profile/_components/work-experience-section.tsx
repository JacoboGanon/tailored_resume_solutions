"use client";

import { Briefcase, Edit, Loader2, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { api, type RouterOutputs } from "~/trpc/react";

type portfolio = RouterOutputs["portfolio"]["getOrCreate"];

export function WorkExperienceSection({
	portfolio,
}: {
	portfolio: portfolio | undefined;
}) {
	const utils = api.useUtils();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingExp, setEditingExp] = useState<
		portfolio["workExperiences"][number] | null
	>(null);
	const [formData, setFormData] = useState({
		jobTitle: "",
		company: "",
		location: "",
		startDate: "",
		endDate: "",
		isCurrent: false,
		bulletPoints: [""],
	});

	const addMutation = api.portfolio.addWorkExperience.useMutation({
		onSuccess: () => {
			toast.success("Work experience added");
			void utils.portfolio.getOrCreate.invalidate();
			setIsDialogOpen(false);
			resetForm();
		},
	});

	const updateMutation = api.portfolio.updateWorkExperience.useMutation({
		onSuccess: () => {
			toast.success("Work experience updated");
			void utils.portfolio.getOrCreate.invalidate();
			setIsDialogOpen(false);
			resetForm();
		},
	});

	const deleteMutation = api.portfolio.deleteWorkExperience.useMutation({
		onSuccess: () => {
			toast.success("Work experience deleted");
			void utils.portfolio.getOrCreate.invalidate();
		},
	});

	const parseBulletsMutation = api.portfolio.parseWorkBulletPoints.useMutation({
		onSuccess: (data) => {
			setFormData({ ...formData, bulletPoints: data });
		},
	});

	const resetForm = () => {
		setFormData({
			jobTitle: "",
			company: "",
			location: "",
			startDate: "",
			endDate: "",
			isCurrent: false,
			bulletPoints: [""],
		});
		setEditingExp(null);
	};

	const handleEdit = (exp: portfolio["workExperiences"][number]) => {
		setEditingExp(exp);
		setFormData({
			jobTitle: exp.jobTitle,
			company: exp.company,
			location: exp.location || "",
			startDate: new Date(exp.startDate).toISOString().slice(0, 7),
			endDate: exp.endDate
				? new Date(exp.endDate).toISOString().slice(0, 7)
				: "",
			isCurrent: exp.isCurrent,
			bulletPoints: exp.bulletPoints,
		});
		setIsDialogOpen(true);
	};

	const handleSubmit = () => {
		const data = {
			jobTitle: formData.jobTitle,
			company: formData.company,
			location: formData.location || undefined,
			startDate: new Date(`${formData.startDate}-01`),
			endDate:
				formData.isCurrent || !formData.endDate
					? null
					: new Date(`${formData.endDate}-01`),
			isCurrent: formData.isCurrent,
			bulletPoints: formData.bulletPoints.filter((b) => b.trim()),
		};

		if (editingExp) {
			updateMutation.mutate({ id: editingExp.id, data });
		} else {
			addMutation.mutate(data);
		}
	};

	const handlePasteBullets = (text: string) => {
		parseBulletsMutation.mutate({ text });
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Work Experience</CardTitle>
						<CardDescription>Your professional work history</CardDescription>
					</div>
					<Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
						<DialogTrigger asChild>
							<Button onClick={resetForm}>
								<Plus className="mr-2 h-4 w-4" />
								Add Experience
							</Button>
						</DialogTrigger>
						<DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
							<DialogHeader>
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
										<Briefcase className="h-5 w-5 text-primary" />
									</div>
									<div>
										<DialogTitle>
											{editingExp ? "Edit" : "Add"} Work Experience
										</DialogTitle>
										<DialogDescription>
											{editingExp
												? "Update the details of your work experience"
												: "Add a new position to your professional history"}
										</DialogDescription>
									</div>
								</div>
							</DialogHeader>

							<Separator className="my-4" />

							{/* Position Details */}
							<div className="space-y-4">
								<h4 className="font-medium text-muted-foreground text-sm">
									Position Details
								</h4>
								<div className="grid gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="jobTitle">
											Job Title <span className="text-destructive">*</span>
										</Label>
										<Input
											id="jobTitle"
											onChange={(e) =>
												setFormData({ ...formData, jobTitle: e.target.value })
											}
											placeholder="Software Engineer"
											value={formData.jobTitle}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="company">
											Company <span className="text-destructive">*</span>
										</Label>
										<Input
											id="company"
											onChange={(e) =>
												setFormData({ ...formData, company: e.target.value })
											}
											placeholder="Tech Corp"
											value={formData.company}
										/>
									</div>
									<div className="space-y-2 md:col-span-2">
										<Label htmlFor="location">Location</Label>
										<Input
											id="location"
											onChange={(e) =>
												setFormData({ ...formData, location: e.target.value })
											}
											placeholder="San Francisco, CA"
											value={formData.location}
										/>
									</div>
								</div>
							</div>

							<Separator />

							{/* Duration */}
							<div className="space-y-4">
								<h4 className="font-medium text-muted-foreground text-sm">
									Duration
								</h4>
								<div className="grid gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="startDate">
											Start Date <span className="text-destructive">*</span>
										</Label>
										<Input
											id="startDate"
											onChange={(e) =>
												setFormData({ ...formData, startDate: e.target.value })
											}
											type="month"
											value={formData.startDate}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="endDate">End Date</Label>
										<Input
											disabled={formData.isCurrent}
											id="endDate"
											onChange={(e) =>
												setFormData({ ...formData, endDate: e.target.value })
											}
											type="month"
											value={formData.endDate}
										/>
									</div>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										checked={formData.isCurrent}
										id="current"
										onCheckedChange={(checked) =>
											setFormData({
												...formData,
												isCurrent: checked as boolean,
											})
										}
									/>
									<Label className="cursor-pointer" htmlFor="current">
										I currently work here
									</Label>
								</div>
							</div>

							<Separator />

							{/* Achievements & Responsibilities */}
							<div className="space-y-4">
								<div>
									<h4 className="font-medium text-muted-foreground text-sm">
										Bullet Points
									</h4>
									<p className="mt-1 text-muted-foreground text-xs">
										Describe your key accomplishments and responsibilities
									</p>
								</div>
								<div className="space-y-3">
									{formData.bulletPoints.map((bullet, index) => (
										<div
											className="flex items-start gap-3"
											key={`bullet-${index}-${bullet.slice(0, 20)}`}
										>
											<div className="flex h-10 min-w-8 items-center justify-center rounded-md bg-muted px-2 font-medium text-muted-foreground text-sm">
												{index + 1}
											</div>
											<Input
												className="flex-1"
												onChange={(e) => {
													const newBullets = [...formData.bulletPoints];
													newBullets[index] = e.target.value;
													setFormData({
														...formData,
														bulletPoints: newBullets,
													});
												}}
												placeholder="Describe an achievement or responsibility"
												value={bullet}
											/>
											<Button
												className="shrink-0 text-muted-foreground hover:text-destructive"
												onClick={() => {
													const newBullets = formData.bulletPoints.filter(
														(_, i) => i !== index,
													);
													setFormData({
														...formData,
														bulletPoints:
															newBullets.length > 0 ? newBullets : [""],
													});
												}}
												size="icon"
												variant="ghost"
											>
												<X className="h-4 w-4" />
											</Button>
										</div>
									))}
									<Button
										className="w-full"
										onClick={() =>
											setFormData({
												...formData,
												bulletPoints: [...formData.bulletPoints, ""],
											})
										}
										size="sm"
										variant="outline"
									>
										<Plus className="mr-2 h-4 w-4" />
										Add Bullet Point
									</Button>
								</div>
								<div className="space-y-2 rounded-lg border bg-muted/50 p-4">
									<Label
										className="font-medium text-sm"
										htmlFor="paste-bullets"
									>
										Quick Import from Clipboard
									</Label>
									<Textarea
										className="resize-none bg-background"
										id="paste-bullets"
										onPaste={(e) => {
											const text = e.clipboardData.getData("text");
											if (text.includes("\n")) {
												e.preventDefault();
												handlePasteBullets(text);
											}
										}}
										placeholder="Paste your bullet points here (supports -, *, •, or numbered lists)"
										rows={3}
									/>
									<p className="text-muted-foreground text-xs">
										💡 Tip: Paste multiple bullet points and they'll be
										automatically parsed
									</p>
								</div>
							</div>

							<DialogFooter className="gap-2">
								<Button
									onClick={() => setIsDialogOpen(false)}
									variant="outline"
								>
									Cancel
								</Button>
								<Button
									disabled={
										addMutation.isPending ||
										updateMutation.isPending ||
										!formData.jobTitle ||
										!formData.company ||
										!formData.startDate
									}
									onClick={handleSubmit}
								>
									{(addMutation.isPending || updateMutation.isPending) && (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									{editingExp ? "Save Changes" : "Add Experience"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</CardHeader>
			<CardContent>
				{portfolio?.workExperiences?.length === 0 ? (
					<p className="py-8 text-center text-muted-foreground">
						No work experience added yet
					</p>
				) : (
					<Accordion className="w-full" collapsible type="single">
						{portfolio?.workExperiences?.map((exp) => {
							return (
								<AccordionItem key={exp.id} value={exp.id}>
									<AccordionTrigger>
										<div className="flex w-full items-start justify-between pr-4">
											<div className="text-left">
												<div className="font-semibold">{exp.jobTitle}</div>
												<div className="text-muted-foreground text-sm">
													{exp.company} • {exp.location}
												</div>
											</div>
										</div>
									</AccordionTrigger>
									<AccordionContent>
										<div className="space-y-2 pt-2">
											<p className="text-muted-foreground text-sm">
												{new Date(exp.startDate).toLocaleDateString("en-US", {
													month: "short",
													year: "numeric",
												})}{" "}
												-{" "}
												{exp.isCurrent
													? "Present"
													: new Date(
															exp.endDate || new Date(),
														).toLocaleDateString("en-US", {
															month: "short",
															year: "numeric",
														})}
											</p>
											<ul className="list-inside list-disc space-y-1">
												{exp.bulletPoints.map((bullet: string) => (
													<li className="text-sm" key={bullet}>
														{bullet}
													</li>
												))}
											</ul>
											<div className="flex gap-2 pt-2">
												<Button
													onClick={() => handleEdit(exp)}
													size="sm"
													variant="outline"
												>
													<Edit className="mr-2 h-4 w-4" />
													Edit
												</Button>
												<Button
													onClick={() => deleteMutation.mutate({ id: exp.id })}
													size="sm"
													variant="destructive"
												>
													<Trash2 className="mr-2 h-4 w-4" />
													Delete
												</Button>
											</div>
										</div>
									</AccordionContent>
								</AccordionItem>
							);
						})}
					</Accordion>
				)}
			</CardContent>
		</Card>
	);
}
