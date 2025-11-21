"use client";

import { Edit, Loader2, Plus, Trash2, Trophy } from "lucide-react";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { api, type RouterOutputs } from "~/trpc/react";

type portfolio = RouterOutputs["portfolio"]["getOrCreate"];

export function AchievementsSection({
	portfolio,
}: {
	portfolio: portfolio | undefined;
}) {
	const utils = api.useUtils();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingAchievement, setEditingAchievement] = useState<
		portfolio["achievements"][number] | null
	>(null);
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		date: "",
		category: "",
	});

	const addMutation = api.portfolio.addAchievement.useMutation({
		onSuccess: () => {
			toast.success("Achievement added");
			void utils.portfolio.getOrCreate.invalidate();
			setIsDialogOpen(false);
			resetForm();
		},
	});

	const updateMutation = api.portfolio.updateAchievement.useMutation({
		onSuccess: () => {
			toast.success("Achievement updated");
			void utils.portfolio.getOrCreate.invalidate();
			setIsDialogOpen(false);
			resetForm();
		},
	});

	const deleteMutation = api.portfolio.deleteAchievement.useMutation({
		onSuccess: () => {
			toast.success("Achievement deleted");
			void utils.portfolio.getOrCreate.invalidate();
		},
	});

	const resetForm = () => {
		setFormData({
			title: "",
			description: "",
			date: "",
			category: "",
		});
		setEditingAchievement(null);
	};

	const handleEdit = (achievement: portfolio["achievements"][number]) => {
		setEditingAchievement(achievement);
		setFormData({
			title: achievement.title,
			description: achievement.description,
			date: achievement.date
				? new Date(achievement.date).toISOString().slice(0, 7)
				: "",
			category: achievement.category,
		});
		setIsDialogOpen(true);
	};

	const handleSubmit = () => {
		const data = {
			title: formData.title,
			description: formData.description,
			date: formData.date ? new Date(`${formData.date}-01`) : null,
			category: formData.category,
		};

		if (editingAchievement) {
			updateMutation.mutate({ id: editingAchievement.id, data });
		} else {
			addMutation.mutate(data);
		}
	};

	const categories = [
		"Competition",
		"Award",
		"Club",
		"Certification",
		"Publication",
		"Other",
	];

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Achievements</CardTitle>
						<CardDescription>
							Awards, competitions, and recognition
						</CardDescription>
					</div>
					<Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
						<DialogTrigger asChild>
							<Button onClick={resetForm}>
								<Plus className="mr-2 h-4 w-4" />
								Add Achievement
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-2xl">
							<DialogHeader>
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
										<Trophy className="h-5 w-5 text-primary" />
									</div>
									<div>
										<DialogTitle>
											{editingAchievement ? "Edit" : "Add"} Achievement
										</DialogTitle>
										<DialogDescription>
											{editingAchievement
												? "Update your achievement details"
												: "Highlight your accomplishments and recognition"}
										</DialogDescription>
									</div>
								</div>
							</DialogHeader>

							<Separator className="my-4" />

							{/* Achievement Details */}
							<div className="space-y-4">
								<h4 className="font-medium text-muted-foreground text-sm">
									Achievement Details
								</h4>
								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="achievementTitle">
											Title <span className="text-destructive">*</span>
										</Label>
										<Input
											id="achievementTitle"
											onChange={(e) =>
												setFormData({ ...formData, title: e.target.value })
											}
											placeholder="First Place in Hackathon"
											value={formData.title}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="achievementDescription">
											Description <span className="text-destructive">*</span>
										</Label>
										<Textarea
											className="resize-none"
											id="achievementDescription"
											onChange={(e) =>
												setFormData({
													...formData,
													description: e.target.value,
												})
											}
											placeholder="Describe the achievement and its significance"
											rows={3}
											value={formData.description}
										/>
									</div>
								</div>
							</div>

							<Separator />

							{/* Category & Date */}
							<div className="space-y-4">
								<h4 className="font-medium text-muted-foreground text-sm">
									Classification
								</h4>
								<div className="grid gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="achievementCategory">
											Category <span className="text-destructive">*</span>
										</Label>
										<Select
											onValueChange={(value) =>
												setFormData({ ...formData, category: value })
											}
											value={formData.category}
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select a category" />
											</SelectTrigger>
											<SelectContent>
												{categories.map((cat) => (
													<SelectItem key={cat} value={cat}>
														{cat}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-2">
										<Label htmlFor="achievementDate">Date</Label>
										<Input
											id="achievementDate"
											onChange={(e) =>
												setFormData({ ...formData, date: e.target.value })
											}
											type="month"
											value={formData.date}
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
										!formData.title ||
										!formData.description ||
										!formData.category
									}
									onClick={handleSubmit}
								>
									{(addMutation.isPending || updateMutation.isPending) && (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									{editingAchievement ? "Save Changes" : "Add Achievement"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</CardHeader>
			<CardContent>
				{portfolio?.achievements?.length === 0 ? (
					<p className="py-8 text-center text-muted-foreground">
						No achievements added yet
					</p>
				) : (
					<div className="space-y-4">
						{portfolio?.achievements?.map((achievement) => (
							<div className="rounded-lg border p-4" key={achievement.id}>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center gap-2">
											<h3 className="font-semibold">{achievement.title}</h3>
											<Badge variant="secondary">{achievement.category}</Badge>
										</div>
										<p className="mt-1 text-muted-foreground text-sm">
											{achievement.description}
										</p>
										{achievement.date && (
											<p className="mt-1 text-muted-foreground text-sm">
												{new Date(achievement.date).toLocaleDateString(
													"en-US",
													{ month: "short", year: "numeric" },
												)}
											</p>
										)}
									</div>
									<div className="flex gap-2">
										<Button
											onClick={() => handleEdit(achievement)}
											size="sm"
											variant="outline"
										>
											<Edit className="h-4 w-4" />
										</Button>
										<Button
											onClick={() =>
												deleteMutation.mutate({ id: achievement.id })
											}
											size="sm"
											variant="destructive"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
