import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const d1_test = sqliteTable('d1_test', {
  id: integer('id').primaryKey(),
  name: text('name'),
}); 