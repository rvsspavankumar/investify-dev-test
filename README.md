**Investify Trust-First Verification MVP**

This project implements a trust-first verification workflow for a SaaS platform, focused on manual human review, server-side RBAC, verification history, and auditability.
It is intentionally minimal in UI and avoids storing sensitive PII, prioritizing correctness, security, and design judgment.

⸻

**🎯 Problem Overview**

The goal of this system is to enable founders or applicants to request verification in order to access specific platform “lanes” (e.g., CAPITAL, PILOT_PARTNERSHIP), while ensuring:
	•	Human-in-the-loop verification (no auto-approval)
	•	Clear separation of roles (Applicant vs Trust Ops)
	•	Auditable state transitions
	•	Secure, server-side authorization

⸻

**🧱 Tech Stack**
	•	Frontend: Next.js (App Router), React, TypeScript
	•	Backend: Next.js API routes
	•	Database: PostgreSQL
	•	ORM: Prisma
	•	Auth: Cookie-based session + server-side RBAC
	•	Infra (local): Docker (Postgres)

⸻

**🔐 Roles & Responsibilities**
	•	Applicant
	•	Submits verification requests
	•	Attaches evidence links (e.g., LinkedIn, website)
	•	Views request status and verification history
	•	Trust Ops Admin
	•	Views pending verification queue
	•	Manually reviews evidence
	•	Approves or denies verification requests

All access control is enforced server-side via RBAC.

⸻

**🔄 Core Workflow**
	1.	Applicant submits a verification request with desired lane(s) and evidence
	2.	Request enters PENDING_REVIEW
	3.	Trust Ops reviews the request and evidence
	4.	Trust Ops approves or denies the request
	5.	System records:
	•	State transition history
	•	Audit log entry
	6.	Applicant sees updated status and full history

⸻

**🗂️ Key URLs **(Local)
	•	Login: /login
	•	Applicant Verification UI: /verify
	•	Trust Ops Queue: /trustops

⸻

**👤 Demo Accounts **(Seeded)

**Role                          Email**

Applicant                     applicant@demo.com

Trust Ops Admin               trustops@demo.com

Institution Admin             instadmin@demo.com

Investor                      investor@demo.com

(No passwords required — login is role-based for demo purposes.)


⸻

**⚙️ Local Setup**

**1️⃣ Install dependencies**

npm install


⸻

**2️⃣ Start PostgreSQL** (Docker)

docker run --name investify-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=investify \
  -p 5433:5432 -d postgres:16

  
⸻

**3️⃣ Environment Variables**

Create a .env file:

DATABASE_URL="postgresql://postgres:postgres@localhost:5433/investify"

⚠️ .env is gitignored and not committed.


⸻

**4️⃣ Run migrations & seed data**

npx prisma migrate dev
npx prisma db seed


⸻

**5️⃣ Start the app**

npm run dev

Visit: http://localhost:3000

**🧪 Verification History & Auditability**

	•	Every verification request maintains a state transition history
	•	Each Trust Ops decision creates:
	•	A verification event (from → to)
	•	An audit log entry with actor, entity, and metadata
	•	History is visible to the Applicant

⸻

**🔒 Security Notes**
	•	All authorization is enforced server-side
	•	Applicants cannot access Trust Ops endpoints
	•	No sensitive PII (e.g., government IDs) is collected or stored
	•	UI restrictions are backed by API-level RBAC checks

⸻

**🧠 Design Notes**
	•	Lane caps are intentionally enforced at the Trust Ops decision layer, allowing policy-based limits to be added later without automating trust decisions.
	•	The system is designed to be extensible for additional roles, lanes, and institutional policies.
	•	UI is intentionally minimal to focus on correctness, trust, and auditability.

⸻

🎥 Walkthrough Video

A short Loom walkthrough demonstrating the full flow (Applicant → Trust Ops → Auditability) is included with the submission.

⸻

**✅ Summary**

This implementation focuses on:
	•	Trust-first workflows
	•	Manual verification
	•	Clear role separation
	•	Strong auditability
	•	Secure, minimal design

It is designed to demonstrate engineering judgment rather than feature completeness.






















