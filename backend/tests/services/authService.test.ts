import {
  describe,
  it,
  expect,
  beforeEach,
  afterAll
} from '@jest/globals';
import bcrypt from 'bcryptjs';
import { AuthService } from '../../src/services/authService';
import prisma from '../../src/config/database';

// Explicitly import Jest globals to fix TypeScript errors

describe('AuthService - Simple Tests', () => {
  beforeEach(async () => {
    // Clean database before each test
    await prisma.user.deleteMany();
    // Add a small delay to ensure database operations complete
    await new Promise(resolve => setTimeout(resolve, 10));
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('register', () => {
    it('should create a new user with hashed password', async () => {
      const userData = {
        email: `test-service-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,
        password: 'password123',
        name: 'Test User'
      };

      const result = await AuthService.register(userData);

      expect(result.user).toMatchObject({
        email: userData.email,
        name: userData.name,
        role: 'USER'
      });
      expect(result.user.id).toBeDefined();

      // Verify password is hashed
      const dbUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });
      expect(dbUser).toBeTruthy();
      expect(
        await bcrypt.compare(userData.password, dbUser!.password)
      ).toBe(true);
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      // First create a user
      const email = `test-service-login-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
      const hashedPassword = await bcrypt.hash('password123', 12);
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: 'Test User'
        }
      });

      const result = await AuthService.login({
        email,
        password: 'password123'
      });

      expect(result.user).toMatchObject({
        email,
        name: 'Test User'
      });
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error with invalid credentials', async () => {
      await expect(
        AuthService.login({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
