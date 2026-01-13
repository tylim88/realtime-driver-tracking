import { type Static, Type } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'
import { and, desc, eq, gte } from 'drizzle-orm'
import { Elysia, t } from 'elysia'
import { db, driverLocations_schema } from '@/db'
import { driverLocations_sub } from '@/pubsub'

export const driverLocation_ws = () => {
	const api = new Elysia().ws('/driverLocation', {
		// when websocket open
		open: async (ws) => {
			const { driver_id_numeric, since } = ws.data.query
			const driver_id = `driver_${driver_id_numeric.padStart(3, '0')}`

			if (!subscribers.has(driver_id)) subscribers.set(driver_id, new Set())
			subscribers.get(driver_id)?.add(ws)

			const data = await db
				.select({
					latitude: driverLocations_schema.latitude,
					longitude: driverLocations_schema.longitude,
					recorded_at: driverLocations_schema.recorded_at,
				})
				.from(driverLocations_schema)
				.where(
					and(
						eq(driverLocations_schema.driver_id, driver_id),
						gte(driverLocations_schema.recorded_at, new Date(since)),
					),
				)
				.orderBy(desc(driverLocations_schema.recorded_at))
				.limit(1000)

			ws.send({
				type: 'data_old',
				data: data.map(({ latitude, longitude, recorded_at }) => ({
					latitude,
					longitude,
					recorded_at: recorded_at.toISOString(),
				})),
			})
		},
		// validate query
		query: t.Object({
			driver_id_numeric: t
				.Transform(t.String())
				.Decode((v) => {
					if (Value.Check(Type.Integer({ minimum: 1 }), Number(v))) return v
					console.error('validation error')
					throw new Error('value must be an integer larger than 1')
				})
				.Encode((v) => v),
			since: t.String({ format: 'date-time' }),
		}),
		// validate response
		response,
		close: (ws) => {
			const { driver_id_numeric } = ws.data.query
			const driver_id = `driver_${driver_id_numeric.padStart(3, '0')}`
			const relatedSubscribers = subscribers.get(driver_id)
			if (relatedSubscribers) {
				const wsRef = Array.from(relatedSubscribers).find((s) => s.id === ws.id)
				if (wsRef) {
					relatedSubscribers.delete(wsRef)
					console.log(`Successfully removed websocket ${ws.id} from memory`)
				} else {
					console.error('no related ws ref')
				}
			} else {
				console.error('no related subscribers')
			}
			// if no users listening to specific driver, remove all ws instance
			if (!subscribers.get(driver_id)?.size && !subscribers.delete(driver_id))
				console.error(
					`warning, delete all ${driver_id} ws unsuccessful, may cause memory leak`,
				)
		},
	})

	// use map over object because we going to change the key and value often https://stackoverflow.com/a/37994079/5338829
	// use Set to make sure the ws object stored is unique (actually doesn't matter that much)
	// this method is used because global websocket publish seem buggy https://github.com/elysiajs/elysia/issues/781, resulting in not able to publish outside of elysia callback
	const subscribers = new Map<
		string,
		Set<
			// get elysia websocket type
			Parameters<NonNullable<Parameters<(typeof api)['ws']>[1]['open']>>[0]
		>
	>()
	// do not listen in ws open event because we only need one redis connection
	driverLocations_sub(({ driver_id, latitude, longitude, recorded_at }) => {
		subscribers.get(driver_id)?.forEach((ws) => {
			ws.send({
				type: 'data_new',
				latitude,
				longitude,
				recorded_at,
				// ws.send type is not properly infered outside of elysia callback
				// have to typecheck it manually with satisfies
			} satisfies Static<typeof response>)
		})
	})
	return api
}

const response = t.Union([
	t.Object({
		type: t.Literal('data_old'),
		data: t.Array(
			t.Object({
				recorded_at: t.String({ format: 'date-time' }),
				latitude: t.Number(),
				longitude: t.Number(),
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
