import { redis } from './__client'

const pub = redis()
const name = 'driverLocation'

type Data = {
	driver_id: string
	latitude: number
	longitude: number
	recorded_at: string
}

export const driverLocations_pub = async (data: Data) =>
	// https://redis.io/docs/latest/commands/xadd/#capped-streams
	pub.xadd(name, 'MAXLEN', '~', 1000, '*', 'data', JSON.stringify(data))

export const driverLocations_sub = async (callback: (data: Data) => void) => {
	// one ioredis instance = one connection https://redis.io/docs/latest/develop/clients/nodejs/migration/
	// create the sub instance the function to make sure that 1 xread = 1 connection when someone call this function (not in this repository, this repository only require one xread)
	// according to https://github.com/redis/lettuce/wiki/Pipelining-and-command-flushing : If you use Redis-blocking commands (e. g. BLPOP) all invocations of the shared connection will be blocked until the blocking command returns which impacts the performance of other threads. Blocking commands can be a reason to use multiple connections.
	// which mean multiple xread with one connection block each other
	const sub = redis()
	// https://github.com/redis/ioredis/issues/747#issuecomment-500735545
	// https://redis.io/docs/latest/commands/xread/
	let lastId = '$'
	while (true) {
		try {
			const reply = await sub.xread(
				'COUNT',
				100,
				'BLOCK',
				5000,
				'STREAMS',
				name,
				lastId,
			)
			reply?.[0]?.[1].forEach(([newLastId, [, data]]) => {
				lastId = newLastId
				// JSON.parse return any but i think this is fine here
				// because we already make driverLocations_pub receives the correct type
				// can add runtime validation if needed
				if (data) callback(JSON.parse(data))
			})
			// prevent cpu exhaustion if something is wrong with xread
			if (!reply)
				await new Promise((res) => {
					setTimeout(res, 100)
				})
		} catch (err) {
			console.error('xread error', err)
			await new Promise((res) => {
				setTimeout(res, 1000)
			})
		}
	}
}

// https://medium.com/manifoldco/using-redis-streams-for-time-series-25de5b12bb46
// https://www.youtube.com/watch?v=rBlnHJZKD_M
// https://medium.com/@ys.yogendra22/system-design-real-time-car-tracking-app-64ce6db83898
// https://dev.to/codexam/building-a-scalable-real-time-driver-tracking-system-26ei
