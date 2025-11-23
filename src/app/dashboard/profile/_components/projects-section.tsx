"use client";

import { Edit, FolderKanban, Loader2, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
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

/**
 * Parse bullet points from pasted text
 * Handles various formats: -, *, •, ●, numbered lists, and multi-line bullets
 */
function parseBulletPoints(text: string): string[] {
	if (!text.trim()) return [];

	// Normalize line endings
	const normalizedText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
	const lines = normalizedText.split("\n");

	const bulletPoints: string[] = [];
	let currentBullet = "";
	let inBullet = false; // Track if we're currently processing a bullet (even if empty)

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i] || "";

		// Check if this line starts with a bullet marker
		// Match: ●, •, -, *, or numbered lists (1., 2., etc.) at start of line
		const bulletMatch = line.match(/^\s*(●|•|[-*]|\d+\.)\s*(.*)$/);

		if (bulletMatch) {
			// Save previous bullet if it exists
			if (inBullet && currentBullet.trim()) {
				bulletPoints.push(currentBullet.trim());
			}
			// Start new bullet with content after marker
			currentBullet = bulletMatch[2] || "";
			inBullet = true; // Mark that we're in bullet mode
		} else if (inBullet && line.trim()) {
			// Continue current bullet (multi-line) - allow continuation even if currentBullet is empty
			// Add space if needed
			const trimmedLine = line.trim();
			if (trimmedLine) {
				currentBullet += (currentBullet ? " " : "") + trimmedLine;
			}
		} else if (inBullet && !line.trim()) {
			// Empty line - finish current bullet
			if (currentBullet.trim()) {
				bulletPoints.push(currentBullet.trim());
			}
			currentBullet = "";
			inBullet = false;
		} else if (!inBullet && line.trim()) {
			// Line without bullet marker and not in bullet mode - treat as standalone bullet
			bulletPoints.push(line.trim());
		}
	}

	// Don't forget the last bullet
	if (inBullet && currentBullet.trim()) {
		bulletPoints.push(currentBullet.trim());
	}

	// If no bullets found with markers, try splitting by double newlines
	if (bulletPoints.length === 0) {
		const doubleNewlineSplit = normalizedText.split(/\n\n+/);
		if (doubleNewlineSplit.length > 1) {
			return doubleNewlineSplit
				.map((part) => part.trim().replace(/\n/g, " "))
				.filter((part) => part.length > 0);
		}
		// Last resort: return as single bullet
		return [normalizedText.trim()].filter((b) => b.length > 0);
	}

	return bulletPoints.filter((bullet) => bullet.length > 0);
}

export function ProjectsSection({
	portfolio,
}: {
	portfolio: portfolio | undefined;
}) {
	const utils = api.useUtils();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingProject, setEditingProject] = useState<
		portfolio["projects"][number] | null
	>(null);
	const [formData, setFormData] = useState({
		name: "",
		bulletPoints: [""],
		technologies: [""],
		url: "",
		startDate: "",
		endDate: "",
	});
	const [pasteText, setPasteText] = useState("");

	const addMutation = api.portfolio.addProject.useMutation({
		onSuccess: () => {
			toast.success("Project added");
			void utils.portfolio.getOrCreate.invalidate();
			setIsDialogOpen(false);
			resetForm();
		},
	});

	const updateMutation = api.portfolio.updateProject.useMutation({
		onSuccess: () => {
			toast.success("Project updated");
			void utils.portfolio.getOrCreate.invalidate();
			setIsDialogOpen(false);
			resetForm();
		},
	});

	const deleteMutation = api.portfolio.deleteProject.useMutation({
		onSuccess: () => {
			toast.success("Project deleted");
			void utils.portfolio.getOrCreate.invalidate();
		},
	});

	const resetForm = () => {
		setFormData({
			name: "",
			bulletPoints: [""],
			technologies: [""],
			url: "",
			startDate: "",
			endDate: "",
		});
		setEditingProject(null);
		setPasteText("");
	};

	const handlePasteBullets = (text: string) => {
		const parsed = parseBulletPoints(text);
		if (parsed.length > 0) {
			setFormData({
				...formData,
				bulletPoints: parsed,
			});
			setPasteText("");
			toast.success(`Added ${parsed.length} bullet points`);
		}
	};

	const handleEdit = (project: portfolio["projects"][number]) => {
		setEditingProject(project);
		setFormData({
			name: project.name,
			bulletPoints:
				project.bulletPoints.length > 0 ? project.bulletPoints : [""],
			technologies: project.technologies,
			url: project.url || "",
			startDate: project.startDate
				? new Date(project.startDate).toISOString().slice(0, 7)
				: "",
			endDate: project.endDate
				? new Date(project.endDate).toISOString().slice(0, 7)
				: "",
		});
		setIsDialogOpen(true);
	};

	const handleSubmit = () => {
		const data = {
			name: formData.name,
			bulletPoints: formData.bulletPoints.filter((b) => b.trim()),
			technologies: formData.technologies.filter((t) => t.trim()),
			url: formData.url || undefined,
			startDate: formData.startDate
				? new Date(`${formData.startDate}-01`)
				: null,
			endDate: formData.endDate ? new Date(`${formData.endDate}-01`) : null,
		};

		if (editingProject) {
			updateMutation.mutate({ id: editingProject.id, data });
		} else {
			addMutation.mutate(data);
		}
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Projects</CardTitle>
						<CardDescription>Your notable projects and work</CardDescription>
					</div>
					<Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
						<DialogTrigger asChild>
							<Button onClick={resetForm}>
								<Plus className="mr-2 h-4 w-4" />
								Add Project
							</Button>
						</DialogTrigger>
						<DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
							<DialogHeader>
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
										<FolderKanban className="h-5 w-5 text-primary" />
									</div>
									<div>
										<DialogTitle>
											{editingProject ? "Edit" : "Add"} Project
										</DialogTitle>
										<DialogDescription>
											{editingProject
												? "Update the details of your project"
												: "Showcase your work and technical skills"}
										</DialogDescription>
									</div>
								</div>
							</DialogHeader>

							<Separator className="my-4" />

							{/* Project Details */}
							<div className="space-y-4">
								<h4 className="font-medium text-muted-foreground text-sm">
									Project Details
								</h4>
								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="projectName">
											Project Name <span className="text-destructive">*</span>
										</Label>
										<Input
											id="projectName"
											onChange={(e) =>
												setFormData({ ...formData, name: e.target.value })
											}
											placeholder="My Awesome Project"
											value={formData.name}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="projectUrl">Project URL</Label>
										<Input
											id="projectUrl"
											onChange={(e) =>
												setFormData({ ...formData, url: e.target.value })
											}
											placeholder="https://github.com/username/project"
											value={formData.url}
										/>
										<p className="text-muted-foreground text-xs">
											Link to your project's repository, demo, or documentation
										</p>
									</div>
								</div>
							</div>

							<Separator />

							{/* Bullet Points */}
							<div className="space-y-4">
								<div>
									<h4 className="font-medium text-muted-foreground text-sm">
										Project Highlights
									</h4>
									<p className="mt-1 text-muted-foreground text-xs">
										Describe key features, achievements, and your contributions
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
												placeholder="Describe a feature or achievement"
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
										onChange={(e) => setPasteText(e.target.value)}
										onPaste={(e) => {
											const text = e.clipboardData.getData("text");
											if (text.trim()) {
												e.preventDefault();
												handlePasteBullets(text);
											}
										}}
										placeholder="Paste your bullet points here (supports -, *, •, or numbered lists)"
										rows={3}
										value={pasteText}
									/>
									<p className="text-muted-foreground text-xs">
										💡 Tip: Paste bullet points and they'll be automatically
										parsed and added above
									</p>
								</div>
							</div>

							<Separator />

							{/* Technologies */}
							<div className="space-y-4">
								<div>
									<h4 className="font-medium text-muted-foreground text-sm">
										Technologies Used
									</h4>
									<p className="mt-1 text-muted-foreground text-xs">
										List the technologies, frameworks, and tools used
									</p>
								</div>
								<div className="space-y-3">
									{formData.technologies.map((tech, index) => (
										<div
											className="flex items-start gap-3"
											key={`tech-${index}-${tech.slice(0, 20)}`}
										>
											<Input
												className="flex-1"
												onChange={(e) => {
													const newTechs = [...formData.technologies];
													newTechs[index] = e.target.value;
													setFormData({ ...formData, technologies: newTechs });
												}}
												placeholder="React, Node.js, PostgreSQL, etc."
												value={tech}
											/>
											<Button
												className="shrink-0 text-muted-foreground hover:text-destructive"
												onClick={() => {
													const newTechs = formData.technologies.filter(
														(_, i) => i !== index,
													);
													setFormData({
														...formData,
														technologies: newTechs.length > 0 ? newTechs : [""],
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
												technologies: [...formData.technologies, ""],
											})
										}
										size="sm"
										variant="outline"
									>
										<Plus className="mr-2 h-4 w-4" />
										Add Technology
									</Button>
								</div>
							</div>

							<Separator />

							{/* Timeline */}
							<div className="space-y-4">
								<h4 className="font-medium text-muted-foreground text-sm">
									Timeline
								</h4>
								<div className="grid gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="projectStartDate">Start Date</Label>
										<Input
											id="projectStartDate"
											onChange={(e) =>
												setFormData({ ...formData, startDate: e.target.value })
											}
											type="month"
											value={formData.startDate}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="projectEndDate">End Date</Label>
										<Input
											id="projectEndDate"
											onChange={(e) =>
												setFormData({ ...formData, endDate: e.target.value })
											}
											type="month"
											value={formData.endDate}
										/>
									</div>
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
										!formData.name ||
										formData.bulletPoints.filter((b) => b.trim()).length === 0
									}
									onClick={handleSubmit}
								>
									{(addMutation.isPending || updateMutation.isPending) && (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									{editingProject ? "Save Changes" : "Add Project"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</CardHeader>
			<CardContent>
				{portfolio?.projects?.length === 0 ? (
					<p className="py-8 text-center text-muted-foreground">
						No projects added yet
					</p>
				) : (
					<div className="space-y-4">
						{portfolio?.projects?.map((project) => {
							return (
								<div className="rounded-lg border p-4" key={project.id}>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<h3 className="font-semibold">{project.name}</h3>
											{project.bulletPoints.length > 0 && (
												<ul className="mt-2 space-y-1">
													{project.bulletPoints.map((bullet, index) => (
														<li
															className="text-muted-foreground text-sm"
															key={`${project.id}-bullet-${index}`}
														>
															• {bullet}
														</li>
													))}
												</ul>
											)}
											<div className="mt-2 flex flex-wrap gap-1">
												{project.technologies.map((tech: string) => (
													<Badge key={tech} variant="outline">
														{tech}
													</Badge>
												))}
											</div>
											{project.url && (
												<a
													className="mt-2 inline-block text-blue-600 text-sm hover:underline"
													href={project.url}
													rel="noopener noreferrer"
													target="_blank"
												>
													View Project
												</a>
											)}
										</div>
										<div className="flex gap-2">
											<Button
												onClick={() => handleEdit(project)}
												size="sm"
												variant="outline"
											>
												<Edit className="h-4 w-4" />
											</Button>
											<Button
												onClick={() =>
													deleteMutation.mutate({ id: project.id })
												}
												size="sm"
												variant="destructive"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
