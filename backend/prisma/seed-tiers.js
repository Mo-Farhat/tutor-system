/**
 * Seed script for Master Tiers
 * Run with: node prisma/seed-tiers.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultTiers = [
  {
    id: 'gold',
    name: 'Gold Tier',
    hourlyRate: 60.00,
    striveCut: 20.00,
    payoutRate: 40.00,
    isActive: true,
  },
  {
    id: 'premium',
    name: 'Premium Tier',
    hourlyRate: 50.00,
    striveCut: 15.00,
    payoutRate: 35.00,
    isActive: true,
  },
  {
    id: 'elite',
    name: 'Elite Tier',
    hourlyRate: 40.00,
    striveCut: 12.00,
    payoutRate: 28.00,
    isActive: true,
  },
];

async function main() {
  console.log('Seeding Master Tiers...');
  
  for (const tier of defaultTiers) {
    const existing = await prisma.masterTier.findUnique({
      where: { id: tier.id },
    });
    
    if (existing) {
      console.log(`  ⏭️  Tier "${tier.id}" already exists, skipping`);
    } else {
      await prisma.masterTier.create({ data: tier });
      console.log(`  ✅ Created tier: ${tier.name} ($${tier.hourlyRate}/hr, $${tier.payoutRate} to tutor)`);
    }
  }
  
  console.log('Done!');
}

main()
  .catch((e) => {
    console.error('Error seeding tiers:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
