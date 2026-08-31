import { prisma } from "../src/infrastructure/database/prisma/prisma.client";

async function checkRemaining() {
  const vendors = await prisma.vendor.findMany({
    select: { id: true, name: true, email: true, source: true },
  });
  console.log("Remaining Vendors in DB:", JSON.stringify(vendors, null, 2));
  await prisma.$disconnect();
}

checkRemaining();
