import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_PASSWORD = "admin@3241873706";
const VIEWER_PASSWORD = "A.Nazar1357";

async function main() {
  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const viewerHash = await bcrypt.hash(VIEWER_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@kpc.local" },
    update: {
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
    create: {
      email: "admin@kpc.local",
      name: "KPC Admin",
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: "viewer@kpc.local" },
    update: {
      passwordHash: viewerHash,
      role: Role.VIEWER,
    },
    create: {
      email: "viewer@kpc.local",
      name: "KPC Viewer",
      passwordHash: viewerHash,
      role: Role.VIEWER,
    },
  });

  const existing = await prisma.project.findFirst({
    where: { name: "North Field Expansion" },
  });

  if (!existing) {
    const project = await prisma.project.create({
      data: {
        name: "North Field Expansion",
        description: "Weekly status notes for the north field expansion track.",
        createdById: admin.id,
        reports: {
          create: [
            {
              title: "Week 12 site walk",
              content:
                "Walked the north trench with the civil team. Formwork is set on bays 3–5. Rebar delivery scheduled for Thursday. No blockers for pouring next Monday if weather holds.",
              createdById: admin.id,
            },
            {
              title: "Safety briefing notes",
              content:
                "All crews completed the refreshed permit briefing. Two near-misses logged last week were closed with updated edge protection. Next audit is Friday morning.",
              createdById: admin.id,
            },
          ],
        },
      },
    });

    await prisma.project.create({
      data: {
        name: "Pipeline Integrity Q4",
        description: "Inspection and integrity reports for Q4.",
        createdById: admin.id,
        reports: {
          create: {
            title: "October inspection summary",
            content:
              "Three segments inspected. Segment B shows coating wear within tolerance. Recommend follow-up UT on weld W-204 during the November shutdown window.",
            createdById: admin.id,
          },
        },
      },
    });

    console.log(`Seeded sample project: ${project.name}`);
  }

  console.log("Seed complete.");
  console.log(`Admin  → admin@kpc.local / ${ADMIN_PASSWORD}`);
  console.log(`Viewer → viewer@kpc.local / ${VIEWER_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
