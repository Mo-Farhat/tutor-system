/**
 * Seed script for initial subjects
 * Run with: node prisma/seed-subjects.js
 */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const subjects = [
  // Year 11/12 - VCE
  { name: "VCE English", curriculum: "VCE", yearLevel: "Year 11/12", isActive: true, sortOrder: 1 },
  { name: "VCE English Language", curriculum: "VCE", yearLevel: "Year 11/12", isActive: true, sortOrder: 2 },
  { name: "VCE Literature", curriculum: "VCE", yearLevel: "Year 11/12", isActive: true, sortOrder: 3 },
  { name: "VCE Mathematical Methods", curriculum: "VCE", yearLevel: "Year 11/12", isActive: true, sortOrder: 4 },
  { name: "VCE Specialist Mathematics", curriculum: "VCE", yearLevel: "Year 11/12", isActive: true, sortOrder: 5 },
  { name: "VCE Further Mathematics", curriculum: "VCE", yearLevel: "Year 11/12", isActive: true, sortOrder: 6 },
  { name: "VCE Biology", curriculum: "VCE", yearLevel: "Year 11/12", isActive: true, sortOrder: 7 },
  { name: "VCE Chemistry", curriculum: "VCE", yearLevel: "Year 11/12", isActive: true, sortOrder: 8 },
  { name: "VCE Physics", curriculum: "VCE", yearLevel: "Year 11/12", isActive: true, sortOrder: 9 },
  { name: "VCE Psychology", curriculum: "VCE", yearLevel: "Year 11/12", isActive: true, sortOrder: 10 },
  { name: "VCE Health and Human Development", curriculum: "VCE", yearLevel: "Year 11/12", isActive: true, sortOrder: 11 },
  { name: "VCE Physical Education", curriculum: "VCE", yearLevel: "Year 11/12", isActive: true, sortOrder: 12 },
  { name: "VCE Business Management", curriculum: "VCE", yearLevel: "Year 11/12", isActive: true, sortOrder: 13 },
  { name: "VCE Accounting", curriculum: "VCE", yearLevel: "Year 11/12", isActive: true, sortOrder: 14 },
  { name: "VCE Economics", curriculum: "VCE", yearLevel: "Year 11/12", isActive: true, sortOrder: 15 },
  { name: "VCE Legal Studies", curriculum: "VCE", yearLevel: "Year 11/12", isActive: true, sortOrder: 16 },
  { name: "VCE History", curriculum: "VCE", yearLevel: "Year 11/12", isActive: true, sortOrder: 17 },
  { name: "VCE Geography", curriculum: "VCE", yearLevel: "Year 11/12", isActive: true, sortOrder: 18 },
  
  // Year 11/12 - HSC (NSW)
  { name: "HSC English Advanced", curriculum: "HSC", yearLevel: "Year 11/12", isActive: true, sortOrder: 1 },
  { name: "HSC English Standard", curriculum: "HSC", yearLevel: "Year 11/12", isActive: true, sortOrder: 2 },
  { name: "HSC Mathematics Advanced", curriculum: "HSC", yearLevel: "Year 11/12", isActive: true, sortOrder: 3 },
  { name: "HSC Mathematics Extension 1", curriculum: "HSC", yearLevel: "Year 11/12", isActive: true, sortOrder: 4 },
  { name: "HSC Mathematics Extension 2", curriculum: "HSC", yearLevel: "Year 11/12", isActive: true, sortOrder: 5 },
  { name: "HSC Biology", curriculum: "HSC", yearLevel: "Year 11/12", isActive: true, sortOrder: 6 },
  { name: "HSC Chemistry", curriculum: "HSC", yearLevel: "Year 11/12", isActive: true, sortOrder: 7 },
  { name: "HSC Physics", curriculum: "HSC", yearLevel: "Year 11/12", isActive: true, sortOrder: 8 },
  { name: "HSC Economics", curriculum: "HSC", yearLevel: "Year 11/12", isActive: true, sortOrder: 9 },
  { name: "HSC Business Studies", curriculum: "HSC", yearLevel: "Year 11/12", isActive: true, sortOrder: 10 },
  { name: "HSC Legal Studies", curriculum: "HSC", yearLevel: "Year 11/12", isActive: true, sortOrder: 11 },
  
  // Year 1-10 - VIC
  { name: "English", curriculum: "VIC", yearLevel: "Year 1-10", isActive: true, sortOrder: 1 },
  { name: "Mathematics", curriculum: "VIC", yearLevel: "Year 1-10", isActive: true, sortOrder: 2 },
  { name: "Science", curriculum: "VIC", yearLevel: "Year 1-10", isActive: true, sortOrder: 3 },
  { name: "HASS (Humanities)", curriculum: "VIC", yearLevel: "Year 1-10", isActive: true, sortOrder: 4 },
  { name: "Reading & Writing", curriculum: "VIC", yearLevel: "Year 1-10", isActive: true, sortOrder: 5 },
  { name: "Spelling & Grammar", curriculum: "VIC", yearLevel: "Year 1-10", isActive: true, sortOrder: 6 },
  
  // Year 1-10 - NSW
  { name: "English", curriculum: "NSW", yearLevel: "Year 1-10", isActive: true, sortOrder: 1 },
  { name: "Mathematics", curriculum: "NSW", yearLevel: "Year 1-10", isActive: true, sortOrder: 2 },
  { name: "Science", curriculum: "NSW", yearLevel: "Year 1-10", isActive: true, sortOrder: 3 },
  { name: "HASS (Humanities)", curriculum: "NSW", yearLevel: "Year 1-10", isActive: true, sortOrder: 4 },
  
  // Year 1-10 - QLD
  { name: "English", curriculum: "QLD", yearLevel: "Year 1-10", isActive: true, sortOrder: 1 },
  { name: "Mathematics", curriculum: "QLD", yearLevel: "Year 1-10", isActive: true, sortOrder: 2 },
  { name: "Science", curriculum: "QLD", yearLevel: "Year 1-10", isActive: true, sortOrder: 3 },
];

async function main() {
  console.log("Seeding subjects...");
  
  for (const subject of subjects) {
    try {
      await prisma.subject.upsert({
        where: {
          name_curriculum_yearLevel: {
            name: subject.name,
            curriculum: subject.curriculum,
            yearLevel: subject.yearLevel,
          },
        },
        update: {},
        create: subject,
      });
      console.log(`✓ ${subject.name} (${subject.curriculum})`);
    } catch (error) {
      console.error(`✗ Failed to seed ${subject.name}:`, error.message);
    }
  }
  
  const count = await prisma.subject.count();
  console.log(`\nDone! Total subjects in database: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
