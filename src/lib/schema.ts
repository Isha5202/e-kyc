import { pgTable, text, serial, integer, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm'; // required for table relationships

//  Settings table
export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  client_id: text('client_id').notNull(),
  client_secret: text('client_secret').notNull(),
  updated_at: timestamp('updated_at').defaultNow(),
});

//  Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  password_hash: text('password_hash').notNull(),
  role: text('role'),
});

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
  inputValue: text('input_value'), // <- Add this line to store input like Aadhaar or PAN
  status: text('status').notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow(),
});

// ✅ KYC Logs relation to users
export const kycLogsRelations = relations(kycLogs, ({ one }) => ({
  user: one(users, {
    fields: [kycLogs.userId],
    references: [users.id],
  }),
}));
