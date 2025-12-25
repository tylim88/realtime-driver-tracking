import { Elysia } from 'elysia'
import { driverLocation_ws } from '@/controller'

new Elysia()
	.use(driverLocation_ws())
	.listen(3001, ({ hostname, port, server }) => {
		console.log(`consumer server is running at ${hostname}:${port}`)
	})
