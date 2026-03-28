# Demo resume text (aim for screening score above 75)

Automated screening compares your **parsed resume** to each role’s **description, responsibilities, and requirements**. Use honest, specific evidence; the model scores against what is written in the job post.

For **any** of the seeded roles (operations, engineering, intern, new grad), resumes that clearly reflect the bullets below tend to score **above the default 75 threshold** when those skills genuinely apply.

## Copy-paste blocks (edit with your real experience)

Use a PDF or DOCX resume with sections similar to:

**Summary**

> Operations and analytics professional with 3+ years delivering data-informed process improvements, stakeholder communication, and workflow tooling in fast-moving teams. Comfortable with SQL, dashboards, Python for analysis, and AI-assisted documentation. Experience coordinating cross-functional launches, QA-style review queues, and executive-ready reporting.

**Experience (example shape)**

> **Operations / Analytics — Company Name**  
> - Owned weekly operating cadence for internal tools; tracked SLAs, exception rates, and throughput in dashboards.  
> - Partnered with product and engineering on workflow fixes, instrumentation gaps, and structured escalation paths.  
> - Built recurring reporting for recruiting and quality metrics; investigated discrepancies between automated recommendations and human decisions.  
> - Strong written communication across technical and non-technical stakeholders; drove structured decisions from ambiguous requirements.

**Skills**

> SQL, Python, spreadsheets, operational dashboards, API fundamentals, Git, agile collaboration, stakeholder management, process documentation, QA and review queues, responsible use of AI tooling.

**Education (for intern / new grad roles)**

> B.S. Computer Science (or related), expected graduation 2026 — coursework in data structures, algorithms, databases, and software engineering projects using TypeScript or Python.

## Tips

- Mirror **keywords** from the job you apply to (e.g. “operations analytics,” “APIs,” “SQL,” “stakeholders”) using real projects.  
- Keep the resume **structured** (clear headings) so parsing extracts skills and roles reliably.  
- Threshold is controlled by `SCREENING_SCORE_THRESHOLD` in `.env` (default 75).
