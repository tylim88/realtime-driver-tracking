import { node } from '@elysiajs/node'
import { type Static, Type } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'
import { and, eq, gte, sql } from 'drizzle-orm'
import { Elysia, t } from 'elysia'
import { db, driverLocations_schema } from '@/db'
import { driverLocations_sub } from '@/pubsub'

export const driverLocation_ws = () => {
	const driverLocation_api = new Elysia({
		// "current adapter doesn't support websocket" error https://github.com/elysiajs/elysia/issues/1008
		adapter: node(),
	}).ws('/driverLocation', {
		// when websocket open
		open: async (ws) => {
			const {
				driver_id: driver_id_,
				since,
				interval_type,
				interval_value,
			} = ws.data.query
			const driver_id = `driver_${driver_id_}`
			if (!subscribers.has(driver_id)) subscribers.set(driver_id, new Set())
			subscribers.get(driver_id)?.add(ws)

			const data = await db
				// drizzle doesn't fully support timescale db, have to type cast with generic
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

			ws.send({
				type: 'data_old',
				data: data.map(({ latitude_average, longitude_average, time }) => ({
					latitude_average,
					longitude_average,
					time: time.toISOString(),
				})),
			})
		},
		// validate query
		query,
		// validate response
		response,
		// when websocket close
		close: (ws) => {
			const { driver_id } = ws.data.query
			const isDeleteSuccessful = subscribers.get(driver_id)?.delete(ws)
			if (!isDeleteSuccessful)
				console.error('warning, delete ws unsuccessful, may cause memory leak')
			if (!subscribers.get(driver_id)?.size) subscribers.delete(driver_id)
		},
	})
	// use map over object because we going to change the key and value often https://stackoverflow.com/a/37994079/5338829
	// use Set to make sure the ws object stored is unique
	const subscribers = new Map<
		string,
		Set<
			// get elysia websocket type
			Parameters<
				NonNullable<Parameters<(typeof driverLocation_api)['ws']>[1]['open']>
			>[0]
		>
	>()

	driverLocations_sub(({ driver_id, latitude, longitude, recorded_at }) => {
		subscribers.get(driver_id)?.forEach((ws) => {
			ws.send({
				type: 'data_new',
				latitude,
				longitude,
				recorded_at,
			} satisfies Static<typeof response>)
		})
	})

	return driverLocation_api
}

const response = t.Union([
	t.Object({
		type: t.Literal('data_old'),
		data: t.Array(
			t.Object({
				time: t.String({ format: 'date-time' }),
				latitude_average: t.Number(),
				longitude_average: t.Number(),
			}),
		),
	}),
	t.Object({
		type: t.Literal('data_new'),
		recorded_at: t.String({ format: 'date-time' }),
		latitude: t.Number(),
		longitude: t.Number(),
	}),
])

const positiveStringInteger = t
	.Transform(t.String())
	.Decode((v) => {
		if (Value.Check(Type.Integer({ minimum: 1 }), Number(v))) return v
		throw new Error('value must be an integer larger than 1')
	})
	.Encode((v) => v)

const query = t.Object({
	driver_id: positiveStringInteger,
	since: t.String({ format: 'date-time' }),
	interval_type: t.Union([
		t.Literal('second'),
		t.Literal('minute'),
		t.Literal('hour'),
	]),
	interval_value: positiveStringInteger,
})

export type Query = Static<typeof query>
