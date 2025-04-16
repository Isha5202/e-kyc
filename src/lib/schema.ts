import { pgTable, text, serial, timestamp } from 'drizzle-orm/pg-core';

export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  client_id: text('client_id').notNull(),
  client_secret: text('client_secret').notNull(),
  updated_at: timestamp('updated_at').defaultNow(),
});
