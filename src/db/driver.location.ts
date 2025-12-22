import {
	doublePrecision,
	pgTable,
	primaryKey,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core'

export const driverLocations_schema = pgTable(
	'driver_locations',
	{
		driver_id: varchar('driver_id', { length: 30 }).notNull(),
		latitude: doublePrecision('latitude').notNull(),
		longitude: doublePrecision('longitude').notNull(),
		recorded_at: timestamp('recorded_at', {
			precision: 3,
			withTimezone: true,
		}).notNull(),
	},
	(table) => [primaryKey({ columns: [table.driver_id, table.recorded_at] })],
)
