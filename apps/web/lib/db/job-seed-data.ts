import { JobStatus, Prisma } from "@prisma/client";

export type SeedJobInput = Prisma.JobCreateInput;

export const seedJobs: SeedJobInput[] = [
  {
    title: "AI Product Operator",
    slug: "ai-product-operator",
    team: "Applied AI",
    location: "New York, NY",
    workModel: "Hybrid",
    level: "Mid-Senior",
    description:
      "Own the day-to-day operating cadence for AI-assisted product workflows. This role sits between product, operations, and data teams to keep experiments moving from prototype to reliable internal tooling.",
    responsibilities: [
      "Run the weekly operating rhythm for AI feature launches and internal adoption.",
      "Translate ambiguous process gaps into scoped workflow improvements and operator playbooks.",
      "Partner with product, recruiting, and analytics stakeholders to monitor quality and throughput.",
      "Maintain prompt, rubric, and escalation hygiene across human-in-the-loop workflows.",
    ],
    requirements: [
      "3+ years in product operations, business operations, or technical program delivery.",
      "Strong written communication and the ability to drive structured decisions across teams.",
      "Comfort working with AI tooling, workflow systems, and data-informed process improvement.",
      "Experience managing production-facing operations with high attention to detail.",
    ],
    status: JobStatus.OPEN,
    openedAt: new Date("2026-03-01T09:00:00.000Z"),
  },
  {
    title: "Forward Deployed Engineer",
    slug: "forward-deployed-engineer",
    team: "Customer Engineering",
    location: "San Francisco, CA",
    workModel: "Hybrid",
    level: "Senior",
    description:
      "Work directly with strategic customers to deploy workflow and AI systems into real operating environments. The role blends backend engineering, integration work, and on-the-ground product iteration.",
    responsibilities: [
      "Design and implement customer-specific workflow integrations against internal platform primitives.",
      "Lead technical discovery and convert business requirements into reliable production delivery plans.",
      "Debug operational issues across APIs, data pipelines, and automation layers.",
      "Feed product insights back into core platform abstractions and developer tooling.",
    ],
    requirements: [
      "5+ years of software engineering experience with strong API and systems fundamentals.",
      "Ability to work across product ambiguity and customer-facing delivery constraints.",
      "Experience shipping integration-heavy systems in cloud or SaaS environments.",
      "Strong ownership, debugging discipline, and clear communication with technical and non-technical partners.",
    ],
    status: JobStatus.OPEN,
    openedAt: new Date("2026-03-05T09:00:00.000Z"),
  },
  {
    title: "AI Operations Analyst",
    slug: "ai-operations-analyst",
    team: "Operations Strategy",
    location: "Remote - United States",
    workModel: "Remote",
    level: "Mid-Level",
    description:
      "Support the measurement and continuous improvement of AI-powered operating workflows. This role focuses on data quality, review queues, exception analysis, and operational reporting.",
    responsibilities: [
      "Monitor AI-assisted workflows for accuracy, latency, and exception trends.",
      "Build recurring reporting for recruiting operations, quality review, and SLA tracking.",
      "Investigate discrepancies between automated recommendations and human decisions.",
      "Coordinate with operations and engineering teams on process fixes and instrumentation gaps.",
    ],
    requirements: [
      "2+ years in operations analytics, business intelligence, or workflow operations.",
      "Comfort working with structured datasets, QA processes, and operational dashboards.",
      "Strong analytical judgment and the ability to identify root causes in messy processes.",
      "Experience collaborating closely with engineering or technical operations teams.",
    ],
    status: JobStatus.OPEN,
    openedAt: new Date("2026-03-10T09:00:00.000Z"),
  },
];
