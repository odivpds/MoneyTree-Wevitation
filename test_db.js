const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const invites = await prisma.invitation.findMany();
  console.log(invites);
}
run();
