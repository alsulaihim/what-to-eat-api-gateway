import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed initial algorithm weights
  const existingWeights = await prisma.algorithmWeights.findFirst();

  if (!existingWeights) {
    const defaultWeights = await prisma.algorithmWeights.create({
      data: {
        socialWeight: 0.4,
        personalWeight: 0.35,
        contextualWeight: 0.15,
        trendsWeight: 0.1,
        updatedBy: 'system',
      },
    });

    console.log('✅ Created default algorithm weights:', defaultWeights);
  } else {
    console.log('⏭️ Algorithm weights already exist, skipping...');
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });