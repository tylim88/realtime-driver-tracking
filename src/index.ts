import { Elysia } from 'elysia'
import { node } from '@elysiajs/node'
import { event_post } from '@/controller'

new Elysia({ adapter: node() })
	.use(event_post)
	.listen(3000, ({ hostname, port }) => {
		console.log(`server is running at ${hostname}:${port}`)
	})
