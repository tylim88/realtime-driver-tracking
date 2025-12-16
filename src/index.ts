import { Elysia } from 'elysia'
import { node } from '@elysiajs/node'

new Elysia({ adapter: node() })
	.post('/event', () => {})
	.listen(3000, ({ hostname, port }) => {
		console.log(`🦊 Elysia is running at ${hostname}:${port}`)
	})
