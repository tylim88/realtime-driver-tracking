import { Elysia } from 'elysia'
import { event_post } from '@/controller'

new Elysia().use(event_post).listen(3000, ({ hostname, port }) => {
	console.log(`ingestion server is running at ${hostname}:${port}`)
})
