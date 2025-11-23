import { getAllInstitutions } from "~/server/cache/institutions";
import { getAllSkills } from "~/server/cache/skills";
import { ProfileContent } from "./_components/profile-content";

export default async function ProfilePage() {
	const [allSkills, allInstitutions] = await Promise.all([
		getAllSkills(),
		getAllInstitutions(),
	]);

	return (
		<ProfileContent allInstitutions={allInstitutions} allSkills={allSkills} />
	);
}
