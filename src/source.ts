import ky from 'ky'
import { db, driverLocations_schema } from '@/db'
import { desc } from 'drizzle-orm'
import randomFloat from 'random-float'

const generateData = async () => {
	const data = await db
		.selectDistinctOn([driverLocations_schema.driver_id])
		.from(driverLocations_schema)
		.orderBy(
			driverLocations_schema.driver_id,
			desc(driverLocations_schema.recorded_at),
		)

	let initialData = data.length
		? data.map(({ recorded_at, ...rest }) => {
				return {
					event: { name: 'driver_location', time: now },
					data: {
						...rest,
						timestamp: recorded_at.toISOString(),
					},
				}
			})
		: sampleData

	setInterval(async () => {
		initialData = await Promise.all(
			initialData.map(
				async ({
					event,
					data: { latitude, longitude, timestamp, ...rest },
				}) => {
					const data = {
						event,
						data: {
							...rest,
							latitude: latitude + randomFloat(0.00005, 0.0001),
							longitude: longitude + randomFloat(0.00005, 0.0001),
							timestamp: new Date().toISOString(),
						},
					}
					await ky
						.post('http://localhost:3000/event', { json: data })
						.json()
						.catch(console.error)

					return data
				},
			),
		)
	}, 5000)
}
generateData()

const now = new Date().toISOString()
const sampleData = [
	{
		event: { name: 'driver_location', time: now },
		data: {
			driver_id: 'driver_001',
			latitude: 1.342597,
			longitude: 103.864783,
			timestamp: now,
		},
	},
	{
		event: { name: 'driver_location', time: now },
		data: {
			driver_id: 'driver_002',
			latitude: 1.350679,
			longitude: 103.8,
			timestamp: now,
		},
	},
	{
		event: { name: 'driver_location', time: now },
		data: {
			driver_id: 'driver_003',
			latitude: 1.331251,
			longitude: 103.879191,
			timestamp: now,
		},
	},
	{
		event: { name: 'driver_location', time: now },
		data: {
			driver_id: 'driver_004',
			latitude: 1.313715,
			longitude: 103.816358,
			timestamp: now,
		},
	},
	{
		event: { name: 'driver_location', time: now },
		data: {
			driver_id: 'driver_005',
			latitude: 1.306921,
			longitude: 103.858259,
			timestamp: now,
		},
	},
	{
		event: { name: 'driver_location', time: now },
		data: {
			driver_id: 'driver_006',
			latitude: 1.353741,
			longitude: 103.855472,
			timestamp: now,
		},
	},
	{
		event: { name: 'driver_location', time: now },
		data: {
			driver_id: 'driver_007',
			latitude: 1.342778,
			longitude: 103.877917,
			timestamp: now,
		},
	},
	{
		event: { name: 'driver_location', time: now },
		data: {
			driver_id: 'driver_008',
			latitude: 1.3238,
			longitude: 103.802374,
			timestamp: now,
		},
	},
	{
		event: { name: 'driver_location', time: now },
		data: {
			driver_id: 'driver_009',
			latitude: 1.33173,
			longitude: 103.859097,
			timestamp: now,
		},
	},
	{
		event: { name: 'driver_location', time: now },
		data: {
			driver_id: 'driver_010',
			latitude: 1.300508,
			longitude: 103.839371,
			timestamp: now,
		},
	},
]
