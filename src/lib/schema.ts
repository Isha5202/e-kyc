import { pgTable, text, serial, timestamp } from 'drizzle-orm/pg-core';

export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  client_id: text('client_id').notNull(),
  client_secret: text('client_secret').notNull(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// ✅ Add and export users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  password_hash: text('password_hash').notNull(), // ✅ this must match the DB column name
  role: text('role'),
});