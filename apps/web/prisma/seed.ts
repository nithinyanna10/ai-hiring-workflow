import { db } from "../lib/db";
import { seedJobs } from "../lib/db/job-seed-data";

async function seedDatabase() {
  for (const job of seedJobs) {
    await db.job.upsert({
      where: { slug: job.slug },
      update: {
        title: job.title,
        team: job.team,
        location: job.location,
        workModel: job.workModel,
        level: job.level,
        description: job.description,
        responsibilities: job.responsibilities,
        requirements: job.requirements,
        status: job.status,
        openedAt: job.openedAt,
      },
      create: job,
    });
  }
}

seedDatabase()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (error) => {
    console.error("Failed to seed database", error);
    await db.$disconnect();
    process.exit(1);
  });
