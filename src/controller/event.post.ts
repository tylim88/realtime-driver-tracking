import { Elysia, t } from 'elysia'
import { driver_locations, db } from '@/db'

export const event_post = new Elysia().post('/event', ({ body }) => body, {
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
})
