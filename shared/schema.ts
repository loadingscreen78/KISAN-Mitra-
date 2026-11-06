// KisanMitra Database Schema
import { pgTable, serial, text, integer, decimal, timestamp, boolean, varchar, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).unique().notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  avatar: text('avatar'),
  joinedDate: timestamp('joined_date').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Listings table
export const listings = pgTable('listings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  crop: varchar('crop', { length: 100 }).notNull(),
  quantity: varchar('quantity', { length: 50 }).notNull(),
  pricePerKg: decimal('price_per_kg', { precision: 10, scale: 2 }).notNull(),
  market: varchar('market', { length: 255 }).notNull(),
  transport: varchar('transport', { length: 10 }).notNull(),
  views: integer('views').default(0).notNull(),
  inquiries: integer('inquiries').default(0).notNull(),
  totalPrice: decimal('total_price', { precision: 12, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).default('active').notNull(), // active, sold, expired
  postedDate: varchar('posted_date', { length: 50 }).notNull(),
  soldDate: timestamp('sold_date'),
  soldPrice: decimal('sold_price', { precision: 12, scale: 2 }),
  buyer: varchar('buyer', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Diagnoses table
export const diagnoses = pgTable('diagnoses', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  cropName: varchar('crop_name', { length: 100 }).notNull(),
  diagnosis: text('diagnosis').notNull(),
  confidence: integer('confidence').notNull(),
  treatment: text('treatment').notNull(),
  date: timestamp('date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Advisory records table
export const advisoryRecords = pgTable('advisory_records', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  savedDate: timestamp('saved_date').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User activities table
export const userActivities = pgTable('user_activities', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  data: jsonb('data'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  listings: many(listings),
  diagnoses: many(diagnoses),
  advisoryRecords: many(advisoryRecords),
  activities: many(userActivities),
}));

export const listingsRelations = relations(listings, ({ one }) => ({
  user: one(users, {
    fields: [listings.userId],
    references: [users.id],
  }),
}));

export const diagnosesRelations = relations(diagnoses, ({ one }) => ({
  user: one(users, {
    fields: [diagnoses.userId],
    references: [users.id],
  }),
}));

export const advisoryRecordsRelations = relations(advisoryRecords, ({ one }) => ({
  user: one(users, {
    fields: [advisoryRecords.userId],
    references: [users.id],
  }),
}));

export const userActivitiesRelations = relations(userActivities, ({ one }) => ({
  user: one(users, {
    fields: [userActivities.userId],
    references: [users.id],
  }),
}));

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Listing = typeof listings.$inferSelect;
export type InsertListing = typeof listings.$inferInsert;
export type Diagnosis = typeof diagnoses.$inferSelect;
export type InsertDiagnosis = typeof diagnoses.$inferInsert;
export type AdvisoryRecord = typeof advisoryRecords.$inferSelect;
export type InsertAdvisoryRecord = typeof advisoryRecords.$inferInsert;
export type UserActivity = typeof userActivities.$inferSelect;
export type InsertUserActivity = typeof userActivities.$inferInsert;