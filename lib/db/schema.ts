import { index, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"

export const submissions = pgTable(
  "submissions",
  {
    id: serial("id").primaryKey(),
    team: text("team").notNull(),
    role: text("role"),
    answers: jsonb("answers").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("submissions_created_idx").on(t.createdAt)],
)

export type Submission = typeof submissions.$inferSelect
