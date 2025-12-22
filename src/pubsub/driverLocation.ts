import { redis } from './__client'

const name = (id: string) => `location of:${id}`

type Data = { latitude: number; longitude: number; recorded_at: number }[]

export const driverLocations_pub = (id: string, data: Data) =>
	redis().publish(name(id), JSON.stringify(data))

export const driverLocations_sub = (callback: (data: Data) => void) => {
	const sub = redis()

	sub.psubscribe(name('*'), (err) => {
		if (err) console.error('failed to subscribe', err)
	})

	sub.on('pmessage', (_, __, message) => {
		callback(JSON.parse(message))
	})
}
