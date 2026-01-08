import { PrismaClient, Role, LaneType, VerificationStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data (safe for local dev)
  await prisma.auditLog.deleteMany();
  await prisma.contactExchange.deleteMany();
  await prisma.accessRequest.deleteMany();
  await prisma.verificationEvent.deleteMany();
  await prisma.evidenceItem.deleteMany();
  await prisma.verificationRequest.deleteMany();
  await prisma.intakeLane.deleteMany();
  await prisma.institution.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // Create users + profiles
  const applicant = await prisma.user.create({
    data: {
      email: "applicant@demo.com",
      role: Role.APPLICANT,
      profile: {
        create: {
          name: "Ravi Founder",
          org: "RaviTech",
          title: "Founder",
          location: "NY",
          linkedinUrl: "https://linkedin.com/in/ravi-demo",
          websiteUrl: "https://ravitech.example",
          intentLanes: [LaneType.CAPITAL, LaneType.PILOT_PARTNERSHIP],
          verificationStatus: VerificationStatus.UNVERIFIED,
        },
      },
    },
    include: { profile: true },
  });

  const decisionMaker = await prisma.user.create({
    data: {
      email: "investor@demo.com",
      role: Role.DECISION_MAKER,
      profile: {
        create: {
          name: "Sarah Investor",
          org: "Demo Ventures",
          title: "Partner",
          location: "SF",
          linkedinUrl: "https://linkedin.com/in/sarah-demo",
          websiteUrl: "https://demoventures.example",
          intentLanes: [LaneType.CAPITAL],
          verificationStatus: VerificationStatus.IDENTITY_VERIFIED,
        },
      },
    },
    include: { profile: true },
  });
  //create institution admin and trust ops admin without profiles as they are not needed.
  const instAdmin = await prisma.user.create({
    data: { email: "instadmin@demo.com", role: Role.INSTITUTION_ADMIN },
  });

  const trustOps = await prisma.user.create({
    data: { email: "trustops@demo.com", role: Role.TRUST_OPS_ADMIN },
  });

  // Create institution + one intake lane
  const institution = await prisma.institution.create({
    data: {
      name: "Siemens (Demo)",
      lanes: {
        create: [
          {
            laneType: LaneType.PILOT_PARTNERSHIP,
            description: "Enterprise pilot intake lane",
            weeklyCap: 2,
            requireVerification: true,
            active: true,
          },
        ],
      },
    },
    include: { lanes: true },
  });

  console.log("✅ Seed complete");
  console.log("Demo users:");
  console.log(" - applicant:", applicant.email, "userId:", applicant.id);
  console.log(" - decision maker:", decisionMaker.email, "userId:", decisionMaker.id);
  console.log(" - institution admin:", instAdmin.email, "userId:", instAdmin.id);
  console.log(" - trust ops admin:", trustOps.email, "userId:", trustOps.id);
  console.log("Institution laneId:", institution.lanes[0].id);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
