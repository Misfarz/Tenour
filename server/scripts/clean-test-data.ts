import { prisma } from "../src/infrastructure/database/prisma/prisma.client";

async function cleanAllTestVendors() {
  console.log("Purging all automated test vendors...");

  const testEmails = [
    "sales@dell.com",
    "sales@hp.com",
    "sales@lenovo.com",
    "inactive@vendor.com",
    "supplier@xyz.com",
    "contact@dell.com",
    "enterprise@hp.com",
  ];

  const deletedVendors = await prisma.vendor.deleteMany({
    where: {
      OR: [
        { email: { in: testEmails } },
        { email: { contains: "1788" } },
        { email: { contains: "hp-platform.com" } },
        { email: { contains: "dell-platform.com" } },
        { email: { contains: "selfreg.com" } },
        { email: { contains: "@example.com" } },
        { name: { contains: "D8" } },
        { name: { contains: "D9" } },
        { name: { contains: "D7" } },
        { name: { contains: "Inactive Supplier" } },
        { name: { contains: "XYZ Vendor" } },
        { name: { contains: "XYZ Exclusive" } },
        { name: { contains: "Platform Tech" } },
        { name: { contains: "Platform Solutions" } },
        { name: { contains: "Self Reg Innovations" } },
        { name: { contains: "Dell Platform" } },
        { name: { contains: "HP Platform" } },
      ],
    },
  });

  console.log(`Deleted ${deletedVendors.count} test vendor records.`);

  const deletedUsers = await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { contains: "1788" } },
        { email: { contains: "hp-platform.com" } },
        { email: { contains: "dell-platform.com" } },
        { email: { contains: "selfreg.com" } },
        { email: { contains: "@example.com" } },
      ],
    },
  });

  console.log(`Deleted ${deletedUsers.count} test user records.`);

  await prisma.$disconnect();
}

cleanAllTestVendors().catch((err) => {
  console.error("Cleanup error:", err);
  prisma.$disconnect();
});
