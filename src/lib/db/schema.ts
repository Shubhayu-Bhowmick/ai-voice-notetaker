import { pgTable, text, timestamp, varchar, uuid, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 200 }).notNull().unique(),
  password_hash: text("password_hash").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull()
});

export const transcriptions = pgTable("transcriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).default("processing").notNull(),
  final_text: text("final_text"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull()
});

export const slices = pgTable("slices", {
  id: uuid("id").primaryKey().defaultRandom(),
  transcription_id: uuid("transcription_id").notNull().references(() => transcriptions.id, { onDelete: "cascade" }),
  slice_index: integer("slice_index").notNull(),
  partial_text: text("partial_text"),
  created_at: timestamp("created_at").defaultNow().notNull()
});

export const dictionary = pgTable("dictionary", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  phrase: varchar("phrase", { length: 200 }).notNull(),
  replacement: varchar("replacement", { length: 200 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull()
});

