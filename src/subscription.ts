import { node } from '@elysiajs/node'
import { Elysia } from 'elysia'
import { driverLocation_ws } from '@/controller'

const app = new Elysia({ adapter: node() })
	.use(driverLocation_ws())
	.listen(3001, ({ hostname, port }) => {
		console.log(`server is running at ${hostname}:${port}`)
	})

export type App = typeof app
