//src\lib\schema.ts

import { pgTable, text, serial, integer, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm'; // required for table relationships
import { hash, compare } from 'bcryptjs';


// Password hashing configuration
const SALT_ROUNDS = 12;

// Simplified Role enum with just admin and user
export const userRoleEnum = pgEnum('user_role', ['admin', 'user']);

//  Settings table
export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  client_id: text('client_id').notNull(),
  client_secret: text('client_secret').notNull(),
  updated_at: timestamp('updated_at').defaultNow(),
});


export const branches = pgTable('branches', {
  id: serial('id').primaryKey(),
  branch_code: text('branch_code').notNull().unique(),
  branch_name: text('branch_name').notNull(),
  address_line1: text('address_line1').notNull(),
  postal_code: text('postal_code'),
  contact_number: text('contact_number'),
  email: text('email'),
  ifsc_code: text('ifsc_code'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  is_active: boolean('is_active').default(true),
});

// Users table with branch_id foreign key
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  role: userRoleEnum('role').default('user'),
  branch_id: integer('branch_id').references(() => branches.id),
});

//  Users relation to branch
export const usersRelations = relations(users, ({ one }) => ({
  branch: one(branches, {
    fields: [users.branch_id],
    references: [branches.id],
  }),
}));

// Refresh Tokens table
export const refreshTokens = pgTable('refresh_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  token: text('token').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});

//  KYC Logs table
export const kycLogs = pgTable('kyc_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  kycType: text('kyc_type').notNull(),
  status: text('status').notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow(),
});

// KYC Logs relation to users
export const kycLogsRelations = relations(kycLogs, ({ one }) => ({
  user: one(users, {
    fields: [kycLogs.userId],
    references: [users.id],
  }),
}));

// System Settings table
export const system_settings = pgTable('system_settings', {
  id: serial('id').primaryKey(),
  setting_key: text('setting_key').notNull().unique(),
  setting_value: text('setting_value').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});


// Password utility functions
export const authHelpers = {
  async hashPassword(password: string): Promise<string> {
    return await hash(password, SALT_ROUNDS);
  },
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await compare(password, hash);
  },
  validatePasswordComplexity(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters' };
    }
    // Add more complexity rules as needed
    return { valid: true };
  }
};

// TypeScript types
export type User = typeof users.$inferSelect;
export type NewUser = Omit<typeof users.$inferInsert, 'password_hash'> & {
  password?: string;
};