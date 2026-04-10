
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkApril2026() {
  const lessons = await prisma.lesson.findMany({
    where: {
      date: {
        gte: new Date('2026-04-01'),
        lt: new Date('2026-05-01'),
      },
    },
    orderBy: { date: 'asc' },
  });

  console.log(JSON.stringify(lessons, null, 2));
  await prisma.$disconnect();
}

checkApril2026();
