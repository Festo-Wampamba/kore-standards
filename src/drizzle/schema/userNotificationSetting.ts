import { boolean, pgTable, varchar } from "drizzle-orm/pg-core";
import { UserTable } from "./user";
import { createdAt, updatedAt } from "../schemaHelpers";
import { relations } from "drizzle-orm";

export const UserNotificationSettingsTable = pgTable ("user_notification_settings", {
    userId: varchar().primaryKey().references(() => UserTable.id, { onDelete: 'cascade' }),
    newJobEmailNotifications: boolean().notNull().default(false),
    aiPrompt: varchar(),
    createdAt,
    updatedAt,
});

export const userNotificationSettingsRelations = relations(UserNotificationSettingsTable, ({ one }) => ({
    user: one(UserTable, {
        fields: [UserNotificationSettingsTable.userId],
        references: [UserTable.id],
    }),
}));