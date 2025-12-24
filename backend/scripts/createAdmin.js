#!/usr/bin/env node

/**
 * Script to create an admin account
 * 
 * Usage:
 *   node scripts/createAdmin.js
 *   
 * You will be prompted to enter admin details, or you can set environment variables:
 *   ADMIN_EMAIL, ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_FIRST_NAME, ADMIN_LAST_NAME
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function createAdmin() {
  console.log('\n🔐 Admin Account Creation Script\n');
  console.log('================================\n');

  try {
    // Get admin details from environment variables or prompt
    const firstName = process.env.ADMIN_FIRST_NAME || await prompt('First Name: ');
    const lastName = process.env.ADMIN_LAST_NAME || await prompt('Last Name: ');
    const email = process.env.ADMIN_EMAIL || await prompt('Email: ');
    const username = process.env.ADMIN_USERNAME || await prompt('Username: ');
    const password = process.env.ADMIN_PASSWORD || await prompt('Password: ');

    // Validate inputs
    if (!firstName || !lastName || !email || !username || !password) {
      console.error('\n❌ Error: All fields are required.');
      process.exit(1);
    }

    if (password.length < 8) {
      console.error('\n❌ Error: Password must be at least 8 characters long.');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        console.error(`\n❌ Error: A user with email "${email}" already exists.`);
      } else {
        console.error(`\n❌ Error: A user with username "${username}" already exists.`);
      }
      process.exit(1);
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password: hashedPassword,
        role: 'admin',
        status: 'active'
      }
    });

    console.log('\n✅ Admin account created successfully!\n');
    console.log('Account Details:');
    console.log('----------------');
    console.log(`  ID:        ${admin.id}`);
    console.log(`  Name:      ${admin.firstName} ${admin.lastName}`);
    console.log(`  Email:     ${admin.email}`);
    console.log(`  Username:  ${admin.username}`);
    console.log(`  Role:      ${admin.role}`);
    console.log(`  Created:   ${admin.createdAt.toISOString()}\n`);

  } catch (error) {
    console.error('\n❌ Error creating admin account:', error.message);
    if (error.code === 'P2002') {
      console.error('   A user with this email or username already exists.');
    }
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

createAdmin();
