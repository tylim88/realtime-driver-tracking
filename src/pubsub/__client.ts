import Redis from 'ioredis'

// because 2 servers sharing the same repo
// and we need to reuse redis connections as much as possible
// we have to prevent ioredis from starting the connection when creating redis new instance
// https://github.com/redis/ioredis/issues/6
export const redis = () =>
	new Redis(process.env.REDIS_URL || '', { lazyConnect: true })

// we use ioredis because upstash redis client run standard HTTP res/req https://upstash.com/docs/redis/howto/connectclient
// ioredis use Redis Serialization Protocol, and with persistent tcp connection this is better for subscription in long lived server
