import ky from 'ky'
import { db, driverLocations_schema } from '@/db'
import { desc } from 'drizzle-orm'

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
					...rest,
					timestamp: recorded_at.toISOString(),
				}
			})
		: sampleData.map(
				({ data: { driver_id, latitude, longitude, timestamp } }) => {
					return {
						driver_id,
						latitude,
						longitude,
						timestamp,
					}
				},
			)
	setInterval(async () => {
		initialData = initialData.map(
			({ latitude, longitude, timestamp, ...rest }) => {
				return {
					...rest,
					latitude: latitude + 0.000075,
					longitude: longitude + 0.000075,
					timestamp,
				}
			},
		)
		await ky
			.post('http://localhost:3000/event', { json: initialData })
			.json()
			.catch(console.error)
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
			driver_id: 'driver_005',
			latitude: 1.306921,
			longitude: 103.858259,
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
			driver_id: 'driver_006',
			latitude: 1.353741,
			longitude: 103.855472,
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
			driver_id: 'driver_002',
			latitude: 1.350679,
			longitude: 103.8,
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
			driver_id: 'driver_010',
			latitude: 1.300508,
			longitude: 103.839371,
			timestamp: now,
		},
	},
	{
		event: { name: 'driver_location', time: now },
		data: {
			driver_id: 'driver_001',
			latitude: 1.343967,
			longitude: 103.863148,
			timestamp: now,
		},
	},
	{
		event: { name: 'driver_location', time: now },
		data: {
			driver_id: 'driver_003',
			latitude: 1.328805,
			longitude: 103.877884,
			timestamp: now,
		},
	},
	{
		event: { name: 'driver_location', time: now },
		data: {
			driver_id: 'driver_007',
			latitude: 1.341502,
			longitude: 103.877935,
			timestamp: now,
		},
	},
	{
		event: { name: 'driver_location', time: now },
		data: {
			driver_id: 'driver_006',
			latitude: 1.352941,
			longitude: 103.854159,
			timestamp: now,
		},
	},
	{
		event: { name: 'driver_location', time: now },
		data: {
			driver_id: 'driver_005',
			latitude: 1.30629,
			longitude: 103.85612,
			timestamp: now,
		},
	},
	{
		event: { name: 'driver_location', time: now },
		data: {
			driver_id: 'driver_004',
			latitude: 1.315117,
			longitude: 103.817729,
			timestamp: now,
		},
	},
	{
		event: { name: 'driver_location', time: now },
		data: {
			driver_id: 'driver_009',
			latitude: 1.331678,
			longitude: 103.861102,
			timestamp: now,
		},
	},
	{
		event: { name: 'driver_location', time: now },
		data: {
			driver_id: 'driver_001',
			latitude: 1.342981,
			longitude: 103.863328,
			timestamp: now,
		},
	},
	{
		event: { name: 'driver_location', time: now },
		data: {
			driver_id: 'driver_002',
			latitude: 1.350585,
			longitude: 103.80007,
			timestamp: now,
		},
	},
	{
		event: { name: 'driver_location', time: now },
		data: {
			driver_id: 'driver_008',
			latitude: 1.326017,
			longitude: 103.801842,
			timestamp: now,
		},
	},
	{
		event: { name: 'driver_location', time: now },
		data: {
			driver_id: 'driver_010',
			latitude: 1.300699,
			longitude: 103.837318,
			timestamp: now,
		},
	},
	{
		event: { name: 'driver_location', time: now },
		data: {
			driver_id: 'driver_003',
			latitude: 1.329538,
			longitude: 103.87776,
			timestamp: now,
		},
	},
	{
		event: { name: 'driver_location', time: now },
		data: {
			driver_id: 'driver_007',
			latitude: 1.342698,
			longitude: 103.88,
			timestamp: now,
		},
	},
	{
		event: { name: 'driver_location', time: now },
		data: {
			driver_id: 'driver_005',
			latitude: 1.30502,
			longitude: 103.857079,
			timestamp: now,
		},
	},
	{
		event: { name: 'driver_location', time: now },
		data: {
			driver_id: 'driver_001',
			latitude: 1.344559,
			longitude: 103.861217,
			timestamp: now,
		},
	},
	{
		event: { name: 'driver_location', time: now },
		data: {
			driver_id: 'driver_004',
			latitude: 1.313993,
			longitude: 103.818398,
			timestamp: now,
		},
	},
	{
		event: { name: 'driver_location', time: now },
		data: {
			driver_id: 'driver_006',
			latitude: 1.353285,
			longitude: 103.854593,
			timestamp: now,
		},
	},
	{
		event: { name: 'driver_location', time: now },
		data: {
			driver_id: 'driver_010',
			latitude: 1.302267,
			longitude: 103.838272,
			timestamp: now,
		},
	},
]
