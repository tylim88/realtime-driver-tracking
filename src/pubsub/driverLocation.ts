import { redis } from './__client'

const pub = redis()
const sub = redis()
const name = (id: string) => `location of:${id}`

type Data = { latitude: number; longitude: number; recorded_at: number }[]

export const driverLocations_pub = (id: string, data: Data) =>
	pub.publish(name(id), JSON.stringify(data))

export const driverLocations_sub = (
	callback: (props: { driver_id: string; data: Data }) => void,
) => {
	sub.psubscribe(name('*'), (err) => {
		if (err) console.error('failed to subscribe', err)
	})
	return sub.on('pmessage', (_, channel, message) => {
		const driver_id = channel.replace(name(''), '')
		// JSON.parse return any but i think this is fine here
		// because we already make driverLocations_pub receives the correct type
		// can add runtime validation if needed
		callback({ driver_id, data: JSON.parse(message) })
	})
}
