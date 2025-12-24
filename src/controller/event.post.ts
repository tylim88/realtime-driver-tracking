import { Elysia, t } from 'elysia'
import { driverLocations_schema, db } from '@/db'
import { driverLocations_pub } from '@/pubsub'

export const event_post = () =>
	new Elysia().post(
		'/event',
		async ({
			body: {
				data: { driver_id, latitude, longitude, timestamp },
			},
		}) => {
			const p1 = driverLocations_pub(driver_id, [
				{
					latitude,
					longitude,
					recorded_at: +new Date(timestamp),
				},
			])
			const p2 = db
				.insert(driverLocations_schema)
				.values({
					driver_id,
					latitude,
					longitude,
					recorded_at: new Date(timestamp),
				})
				.onConflictDoUpdate({
					target: [
						driverLocations_schema.driver_id,
						driverLocations_schema.recorded_at,
					],
					set: {
						latitude,
						longitude,
					},
				})
			await Promise.allSettled([p1, p2])
		},
		{
			body: t.Object({
				event: t.Object({
					name: t.Literal('driver_location'),
					time: t.String({ format: 'date-time' }),
				}),
				data: t.Object({
					driver_id: t.String(),
					latitude: t.Numeric(),
					longitude: t.Numeric(),
					timestamp: t.String({ format: 'date-time' }),
				}),
			}),
		},
	)
