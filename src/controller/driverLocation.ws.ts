import { Elysia, t } from 'elysia'
import { node } from '@elysiajs/node'
import { driverLocations_schema, db } from '@/db'
import { driverLocations_sub } from '@/pubsub'
import { gte, and, eq, sql } from 'drizzle-orm'
import { Type } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'

export const driverLocation_ws = () => {
	// "current adapter doesn't support websocket" error
	// https://github.com/elysiajs/elysia/issues/1008
	const driverLocation_api = new Elysia({ adapter: node() }).ws(
		'/driverLocation',
		{
			query: t.Object({
				driver_id: t.String(),
				since: t.String({ format: 'date-time' }),
				interval_type: t.Union([
					t.Literal('second'),
					t.Literal('minute'),
					t.Literal('hour'),
				]),
				interval_value: t
					.Transform(t.String())
					.Decode((v) => {
						if (Value.Check(Type.Integer({ minimum: 1 }), Number(v))) return v
						throw new Error('not integer')
					})
					.Encode((v) => v),
			}),
			open: async (ws) => {
				const { driver_id, since, interval_type, interval_value } =
					ws.data.query

				const data = await db
					// drizzle doesn't fully support timescale db
					// have to type cast here using generic
					.select({
						// https://www.tigerdata.com/docs/api/latest/hyperfunctions/time_bucket
						time: sql<Date>`time_bucket(${interval_value} ${interval_type}, ${driverLocations_schema.recorded_at})`.as(
							'time',
						),
						latitude_average: sql<number>`avg(${driverLocations_schema.latitude})`,
						longitude_average: sql<number>`avg(${driverLocations_schema.longitude})`,
					})
					.from(driverLocations_schema)
					.where(
						and(
							eq(driverLocations_schema.driver_id, driver_id),
							gte(driverLocations_schema.recorded_at, new Date(since)),
						),
					)
					.orderBy(driverLocations_schema.recorded_at)

				if (!subscribers.has(driver_id)) subscribers.set(driver_id, new Set())
				subscribers.get(driver_id)?.add(ws)
			},
			close: (ws) => {
				const { driver_id } = ws.data.query
				subscribers.get(driver_id)?.delete(ws)
				if (!subscribers.get(driver_id)?.size) subscribers.delete(driver_id)
			},
		},
	)
	// use map over object because we going to change the key and value often
	// https://stackoverflow.com/a/37994079/5338829
	// use Set to make sure the ws object stored is unique
	const subscribers = new Map<
		string,
		Set<
			Parameters<
				NonNullable<Parameters<(typeof driverLocation_api)['ws']>[1]['open']>
			>[0]
		>
	>()

	driverLocations_sub(({ data, driver_id }) => {})

	return driverLocation_api
}
