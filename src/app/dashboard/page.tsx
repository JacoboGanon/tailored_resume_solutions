import { redirect } from "next/navigation";

export default function DashboardPage() {
	// Redirect to the profile page by default
	redirect("/dashboard/profile");
}
