import { redirect } from "next/navigation";

// The team is managed from the About page admin.
export default function AdminTeam() {
  redirect("/admin/about");
}
