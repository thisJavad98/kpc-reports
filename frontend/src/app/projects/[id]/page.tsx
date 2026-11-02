import { redirect } from "next/navigation";
import { DEFAULT_TAB_SLUG, projectTabHref } from "@/lib/project-tabs";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(projectTabHref(id, DEFAULT_TAB_SLUG));
}
